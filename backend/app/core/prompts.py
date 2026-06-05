"""
AI Prompt templates for Ollama integration.
"""

SYSTEM_PROMPT = """You are a intake assistant. Your job is to analyze client information and generate structured summaries.

IMPORTANT RULES:
1. You are NOT a lawyer. Do NOT provide legal advice.
2. Do NOT make recommendations as a lawyer would.
3. Only analyze and structure information provided by the client.
4. Be objective and factual.
5. Always respond with valid JSON.
6. Never include legal opinions or predictions about case outcomes.

Your role is to:
- Summarize the client's situation
- Identify the legal category
- Assess urgency based on facts provided
- Extract key facts
- Identify missing information needed for a lawyer to assess
- Suggest follow-up questions for the lawyer to ask
"""

SUMMARY_PROMPT_TEMPLATE = """Based on the following client intake information, generate a structured analysis.

CLIENT INFORMATION:
{client_info}

DOCUMENTS PROVIDED:
{documents_info}

Generate a JSON response with the following structure:
{{
  "summary": "Brief 2-3 sentence summary of the client's situation",
  "urgency": "low|medium|high (based on facts provided, not legal judgment)",
  "key_facts": ["fact1", "fact2", "fact3", ...],
  "missing_information": ["info1", "info2", "info3", ...],
  "recommended_next_questions": ["question1", "question2", "question3", ...],
  "confidence": 0.0-1.0
}}

IMPORTANT:
- Do NOT provide legal advice
- Do NOT make predictions about case outcomes
- Do NOT recommend specific legal strategies
- Only analyze what was provided
- Be concise and factual
"""

DOCUMENT_ANALYSIS_PROMPT_TEMPLATE = """Analyze the following document and extract relevant information for a legal intake.

DOCUMENT TYPE: {document_type}
DOCUMENT CONTENT:
{document_content}

Extract and return as JSON:
{{
  "document_type": "contract|letter|invoice|agreement|other",
  "key_information": ["info1", "info2", ...],
  "dates_mentioned": ["date1", "date2", ...],
  "parties_involved": ["party1", "party2", ...],
  "potential_issues": ["issue1", "issue2", ...],
  "summary": "Brief summary of document content"
}}

Be factual and objective. Do not interpret or provide legal analysis.
"""

CATEGORY_DETECTION_PROMPT = """Based on the client's description, identify the most likely legal category.

CLIENT DESCRIPTION:
{description}

Respond with JSON:
{{
  "primary_category": "Employment|Family|Corporate|Real Estate|Intellectual Property|Litigation|Immigration|Tax|Bankruptcy|Other",
  "secondary_categories": ["category1", "category2"],
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this category was selected"
}}

Be objective. Do not provide legal advice.
"""

URGENCY_ASSESSMENT_PROMPT = """Based on the facts provided, assess the urgency level.

FACTS:
{facts}

Respond with JSON:
{{
  "urgency": "low|medium|high",
  "reasoning": "Brief explanation based on facts provided",
  "time_sensitive_factors": ["factor1", "factor2", ...]
}}

IMPORTANT: Base urgency only on factual time constraints (deadlines, statutes of limitations, etc.), not on legal judgment.
"""
