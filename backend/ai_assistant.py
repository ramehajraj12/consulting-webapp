from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import Dict, Any, Optional
import json
import os
from datetime import datetime

class StatisticalAIAssistant:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required. Please set OPENAI_API_KEY environment variable.")
    
    async def generate_analysis_recommendations(self, 
                                               analysis_type: str, 
                                               results: Dict[str, Any], 
                                               dataset_info: Dict[str, Any],
                                               user_context: Optional[Dict[str, Any]] = None) -> str:
        """Generate AI-powered recommendations based on analysis results"""
        
        # Create a unique session ID for this analysis
        session_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=self.openai_api_key,
            session_id=session_id,
            system_message="""You are a professional statistical analysis assistant specializing in SPSS-style analysis interpretation. 
            You provide clear, actionable recommendations based on statistical results. Your responses should be:
            1. Professional and academic in tone
            2. Include APA-style interpretations
            3. Provide next-step recommendations
            4. Explain statistical significance in practical terms
            5. Suggest follow-up analyses when appropriate
            6. Use proper statistical terminology
            7. Format responses in a clear, structured manner"""
        ).with_model("openai", "gpt-4o").with_max_tokens(1000)
        
        # Prepare context message
        context_message = self._prepare_context_message(analysis_type, results, dataset_info, user_context)
        
        # Send message to AI
        user_message = UserMessage(text=context_message)
        response = await chat.send_message(user_message)
        
        return response
    
    def _prepare_context_message(self, analysis_type: str, results: Dict[str, Any], 
                                dataset_info: Dict[str, Any], user_context: Optional[Dict[str, Any]] = None) -> str:
        """Prepare context message for AI assistant"""
        
        context_parts = [
            f"Analysis Type: {analysis_type.replace('_', ' ').title()}",
            f"Dataset: {dataset_info.get('name', 'Unknown')} ({dataset_info.get('rows', 0)} rows, {dataset_info.get('columns', 0)} columns)",
            f"Analysis Results: {json.dumps(results, indent=2)}"
        ]
        
        if user_context:
            context_parts.append(f"User Context: {json.dumps(user_context, indent=2)}")
        
        request_message = """
        Based on the above statistical analysis results, please provide:
        
        1. **Interpretation**: Clear explanation of what the results mean in practical terms
        2. **Statistical Significance**: Interpretation of p-values and confidence intervals
        3. **Effect Size**: Comment on practical significance (if applicable)
        4. **APA Style Summary**: Brief APA-formatted result statement
        5. **Next Steps**: Recommended follow-up analyses or actions
        6. **Assumptions**: Any assumptions that should be verified
        7. **Limitations**: Key limitations to consider
        
        Keep the response professional, clear, and actionable for researchers and analysts.
        """
        
        return "\n\n".join(context_parts) + "\n\n" + request_message
    
    async def generate_apa_table(self, analysis_type: str, results: Dict[str, Any]) -> str:
        """Generate APA-formatted table from analysis results"""
        
        session_id = f"apa_table_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        chat = LlmChat(
            api_key=self.openai_api_key,
            session_id=session_id,
            system_message="""You are an expert in APA formatting and statistical reporting. 
            Create properly formatted APA-style tables from statistical analysis results. 
            Follow APA 7th edition guidelines for table formatting, including:
            1. Proper table structure with clear headers
            2. Correct decimal places for different statistics
            3. Appropriate use of italics for statistical symbols
            4. Proper spacing and alignment
            5. Clear footnotes when necessary
            6. Standard APA table formatting conventions"""
        ).with_model("openai", "gpt-4o").with_max_tokens(800)
        
        message = f"""
        Create an APA-formatted table for the following {analysis_type.replace('_', ' ')} analysis results:
        
        {json.dumps(results, indent=2)}
        
        Please format this as a proper APA table with appropriate headers, decimal places, and statistical notation.
        Include table title and any necessary footnotes.
        """
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return response
    
    async def generate_study_recommendations(self, 
                                           datasets: list, 
                                           completed_analyses: list,
                                           user_profile: Dict[str, Any]) -> str:
        """Generate recommendations for next analyses based on user's work"""
        
        session_id = f"study_rec_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        chat = LlmChat(
            api_key=self.openai_api_key,
            session_id=session_id,
            system_message="""You are a research methodology expert who helps researchers plan their statistical analyses. 
            Based on the user's datasets and completed analyses, suggest logical next steps, 
            additional analyses that would strengthen their research, and methodological considerations."""
        ).with_model("openai", "gpt-4o").with_max_tokens(1200)
        
        message = f"""
        User Profile: {json.dumps(user_profile, indent=2)}
        
        Available Datasets: {json.dumps([{'name': d.get('name'), 'columns': len(d.get('column_info', {})), 'rows': d.get('rows')} for d in datasets], indent=2)}
        
        Completed Analyses: {json.dumps([{'type': a.get('analysis_type'), 'dataset': a.get('dataset_id')} for a in completed_analyses[-10:]], indent=2)}
        
        Based on this information, please provide:
        1. Recommended next analyses
        2. Potential research questions to explore
        3. Methodological suggestions
        4. Data quality considerations
        5. Statistical power considerations (if applicable)
        
        Focus on actionable, specific recommendations that would enhance the research.
        """
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return response
    
    async def explain_statistical_concept(self, concept: str, context: Optional[str] = None) -> str:
        """Explain statistical concepts in clear, accessible language"""
        
        session_id = f"explain_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        chat = LlmChat(
            api_key=self.openai_api_key,
            session_id=session_id,
            system_message="""You are a statistics educator who explains complex statistical concepts in clear, 
            accessible language. Use examples and analogies when helpful, and always connect concepts to practical applications."""
        ).with_model("openai", "gpt-4o").with_max_tokens(800)
        
        message = f"""
        Please explain the statistical concept: {concept}
        
        {f"Context: {context}" if context else ""}
        
        Provide a clear explanation that includes:
        1. Definition and purpose
        2. When to use it
        3. How to interpret results
        4. Common misconceptions
        5. Practical example
        
        Keep the explanation accessible but accurate.
        """
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        return response