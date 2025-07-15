from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List, Optional
import uuid
import re

from models.blog import (
    BlogPost, BlogPostCreate, BlogPostUpdate, BlogPostResponse,
    BlogCategory, BlogCategoryCreate, BlogCategoryResponse,
    BlogComment, BlogCommentCreate, BlogCommentResponse
)
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/blog", tags=["Blog"])

# Get database connection
from database import db


def calculate_reading_time(content: str) -> int:
    """Calculate estimated reading time in minutes"""
    words = len(content.split())
    return max(1, round(words / 200))  # Average 200 words per minute


def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
    slug = re.sub(r'\s+', '-', slug)
    return slug.strip('-')


# Blog Posts Endpoints
@router.get("/posts", response_model=List[BlogPostResponse])
async def get_blog_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get blog posts with filtering and pagination"""
    
    # Build query
    query = {}
    
    # Only show published posts to non-admin users
    if not current_user or current_user.role != "admin":
        query["status"] = "published"
    elif status:
        query["status"] = status
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}}
        ]
    
    # Get posts
    cursor = db.blog_posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
    posts = []
    
    async for post in cursor:
        post['id'] = str(post['_id'])
        if '_id' in post:
            del post['_id']
        posts.append(BlogPostResponse(**post))
    
    return posts


@router.get("/posts/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(
    post_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific blog post"""
    
    post = await db.blog_posts.find_one({"_id": post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post nuk u gjet"
        )
    
    # Check if user can view unpublished posts
    if post["status"] != "published" and (not current_user or current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nuk keni leje të shikoni këtë post"
        )
    
    # Increment views
    await db.blog_posts.update_one(
        {"_id": post_id},
        {"$inc": {"views": 1}}
    )
    
    post['id'] = str(post['_id'])
    if '_id' in post:
        del post['_id']
    
    return BlogPostResponse(**post)


@router.post("/posts", response_model=BlogPostResponse)
async def create_blog_post(
    post_data: BlogPostCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new blog post (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të krijojnë blog posts"
        )
    
    # Calculate reading time
    reading_time = calculate_reading_time(post_data.content)
    
    # Create post
    post = BlogPost(
        author_id=current_user.id,
        author_name=current_user.name,
        reading_time=reading_time,
        **post_data.dict()
    )
    
    # Set published_at if status is published
    if post.status == "published":
        post.published_at = datetime.utcnow()
    
    # Insert into database
    post_dict = post.dict()
    post_dict['_id'] = post_dict.pop('id')
    result = await db.blog_posts.insert_one(post_dict)
    post.id = str(result.inserted_id)
    
    return BlogPostResponse(**post.dict())


@router.put("/posts/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: str,
    post_data: BlogPostUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a blog post (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të përditësojnë blog posts"
        )
    
    # Check if post exists
    existing_post = await db.blog_posts.find_one({"_id": post_id})
    if not existing_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post nuk u gjet"
        )
    
    # Prepare update data
    update_data = post_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Update reading time if content changed
    if "content" in update_data:
        update_data["reading_time"] = calculate_reading_time(update_data["content"])
    
    # Set published_at if status changed to published
    if update_data.get("status") == "published" and existing_post.get("status") != "published":
        update_data["published_at"] = datetime.utcnow()
    
    # Update post
    await db.blog_posts.update_one(
        {"_id": post_id},
        {"$set": update_data}
    )
    
    # Get updated post
    updated_post = await db.blog_posts.find_one({"_id": post_id})
    updated_post['id'] = str(updated_post['_id'])
    if '_id' in updated_post:
        del updated_post['_id']
    
    return BlogPostResponse(**updated_post)


@router.delete("/posts/{post_id}")
async def delete_blog_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a blog post (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të fshijnë blog posts"
        )
    
    result = await db.blog_posts.delete_one({"_id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post nuk u gjet"
        )
    
    return {"message": "Post u fshi me sukses"}


# Blog Categories Endpoints
@router.get("/categories", response_model=List[BlogCategoryResponse])
async def get_blog_categories():
    """Get all blog categories"""
    
    cursor = db.blog_categories.find({}).sort("name", 1)
    categories = []
    
    async for category in cursor:
        category['id'] = str(category['_id'])
        if '_id' in category:
            del category['_id']
        categories.append(BlogCategoryResponse(**category))
    
    return categories


@router.post("/categories", response_model=BlogCategoryResponse)
async def create_blog_category(
    category_data: BlogCategoryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new blog category (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të krijojnë kategori"
        )
    
    # Check if category already exists
    existing = await db.blog_categories.find_one({"slug": category_data.slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kategoria me këtë slug ekziston tashmë"
        )
    
    # Create category
    category = BlogCategory(**category_data.dict())
    
    # Insert into database
    category_dict = category.dict()
    category_dict['_id'] = category_dict.pop('id')
    result = await db.blog_categories.insert_one(category_dict)
    category.id = str(result.inserted_id)
    
    return BlogCategoryResponse(**category.dict())


# Blog Comments Endpoints
@router.get("/posts/{post_id}/comments", response_model=List[BlogCommentResponse])
async def get_post_comments(
    post_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get comments for a blog post"""
    
    # Only show approved comments to non-admin users
    query = {"post_id": post_id}
    if not current_user or current_user.role != "admin":
        query["status"] = "approved"
    
    cursor = db.blog_comments.find(query).sort("created_at", -1)
    comments = []
    
    async for comment in cursor:
        comment['id'] = str(comment['_id'])
        if '_id' in comment:
            del comment['_id']
        comments.append(BlogCommentResponse(**comment))
    
    return comments


@router.post("/posts/{post_id}/comments", response_model=BlogCommentResponse)
async def create_comment(
    post_id: str,
    comment_data: BlogCommentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a comment on a blog post"""
    
    # Check if post exists
    post = await db.blog_posts.find_one({"_id": post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post nuk u gjet"
        )
    
    # Create comment
    comment = BlogComment(
        post_id=post_id,
        author_id=current_user.id,
        author_name=current_user.name,
        content=comment_data.content
    )
    
    # Insert into database
    comment_dict = comment.dict()
    comment_dict['_id'] = comment_dict.pop('id')
    result = await db.blog_comments.insert_one(comment_dict)
    comment.id = str(result.inserted_id)
    
    return BlogCommentResponse(**comment.dict())


@router.put("/comments/{comment_id}/approve")
async def approve_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Approve a comment (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vetëm administratorët mund të aprovoj komente"
        )
    
    result = await db.blog_comments.update_one(
        {"_id": comment_id},
        {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Koment nuk u gjet"
        )
    
    return {"message": "Komenti u aprovua me sukses"}


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user)
):
    """Like a blog post"""
    
    # Check if post exists
    post = await db.blog_posts.find_one({"_id": post_id})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post nuk u gjet"
        )
    
    # Check if user already liked this post
    existing_like = await db.blog_likes.find_one({
        "post_id": post_id,
        "user_id": current_user.id
    })
    
    if existing_like:
        # Unlike
        await db.blog_likes.delete_one({"_id": existing_like["_id"]})
        await db.blog_posts.update_one(
            {"_id": post_id},
            {"$inc": {"likes": -1}}
        )
        return {"message": "Post u hoq nga pëlqimet", "liked": False}
    else:
        # Like
        await db.blog_likes.insert_one({
            "_id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": current_user.id,
            "created_at": datetime.utcnow()
        })
        await db.blog_posts.update_one(
            {"_id": post_id},
            {"$inc": {"likes": 1}}
        )
        return {"message": "Post u pëlqye me sukses", "liked": True}