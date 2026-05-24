"""
PDF document processing service.
"""

import fitz  # PyMuPDF
import logging
from typing import Optional, Tuple
from io import BytesIO

logger = logging.getLogger(__name__)


class PDFService:
    """Service for processing PDF documents."""

    @staticmethod
    def extract_text(pdf_bytes: bytes, max_pages: Optional[int] = None) -> str:
        """
        Extract text from PDF.

        Args:
            pdf_bytes: PDF file content as bytes
            max_pages: Maximum number of pages to extract (None = all)

        Returns:
            Extracted text
        """
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""

            for page_num, page in enumerate(pdf_document):
                if max_pages and page_num >= max_pages:
                    break

                text += page.get_text()
                text += "\n---PAGE BREAK---\n"

            pdf_document.close()
            return text.strip()

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return ""

    @staticmethod
    def get_metadata(pdf_bytes: bytes) -> dict:
        """
        Extract metadata from PDF.

        Args:
            pdf_bytes: PDF file content as bytes

        Returns:
            Dictionary with metadata
        """
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            metadata = pdf_document.metadata or {}

            result = {
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "subject": metadata.get("subject", ""),
                "creator": metadata.get("creator", ""),
                "producer": metadata.get("producer", ""),
                "creation_date": metadata.get("creationDate", ""),
                "modification_date": metadata.get("modDate", ""),
                "pages": pdf_document.page_count,
            }

            pdf_document.close()
            return result

        except Exception as e:
            logger.error(f"Error extracting metadata from PDF: {e}")
            return {}

    @staticmethod
    def get_page_count(pdf_bytes: bytes) -> int:
        """Get number of pages in PDF."""
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            count = pdf_document.page_count
            pdf_document.close()
            return count
        except Exception as e:
            logger.error(f"Error getting page count: {e}")
            return 0

    @staticmethod
    def extract_text_by_page(pdf_bytes: bytes) -> list[str]:
        """
        Extract text from each page separately.

        Returns:
            List of text strings, one per page
        """
        try:
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            pages_text = []

            for page in pdf_document:
                pages_text.append(page.get_text())

            pdf_document.close()
            return pages_text

        except Exception as e:
            logger.error(f"Error extracting text by page: {e}")
            return []

    @staticmethod
    def detect_document_type(text: str, filename: str) -> str:
        """
        Attempt to detect document type based on content and filename.

        Args:
            text: Extracted text from document
            filename: Original filename

        Returns:
            Document type (contract, letter, invoice, agreement, other)
        """
        text_lower = text.lower()
        filename_lower = filename.lower()

        # Check for common keywords
        if any(
            keyword in text_lower
            for keyword in [
                "agreement",
                "contract",
                "terms and conditions",
                "whereas",
                "party",
            ]
        ):
            return "contract"

        if any(
            keyword in text_lower
            for keyword in ["invoice", "bill", "amount due", "payment terms"]
        ):
            return "invoice"

        if any(
            keyword in text_lower
            for keyword in ["dear", "sincerely", "regards", "letter"]
        ):
            return "letter"

        if any(
            keyword in text_lower
            for keyword in ["agreement", "terms", "conditions", "effective date"]
        ):
            return "agreement"

        # Check filename
        if "invoice" in filename_lower:
            return "invoice"
        if "contract" in filename_lower:
            return "contract"
        if "letter" in filename_lower:
            return "letter"

        return "other"

    @staticmethod
    def summarize_text(text: str, max_length: int = 500) -> str:
        """
        Create a brief summary of extracted text.

        Args:
            text: Full text
            max_length: Maximum length of summary

        Returns:
            Summarized text
        """
        if len(text) <= max_length:
            return text

        # Simple summarization: take first max_length characters
        # In production, use AI summarization
        summary = text[:max_length]
        last_period = summary.rfind(".")
        if last_period > 0:
            summary = summary[:last_period + 1]

        return summary


# Singleton instance
pdf_service = PDFService()
