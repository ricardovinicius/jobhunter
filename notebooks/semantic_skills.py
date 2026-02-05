"""
Semantic Skill Matching Module

Uses sentence-transformers to match job skills against resume skills
using semantic embeddings instead of exact string matching.
"""

from typing import Literal
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import torch


class SkillMatch(BaseModel):
    """Result of matching a single job skill against resume."""
    skill_name: str                      # Job skill being checked
    canonical_name: str                  # Matched resume skill (if found)
    match_type: Literal["exact", "semantic", "text_evidence", "none"]
    is_matched: bool
    confidence_score: float = 0.0        # 0.0-1.0 similarity score
    evidence_source: str = ""            # Where the match was found


class SemanticSkillMatcher:
    """
    Semantic skill matcher using sentence embeddings.
    
    Example usage:
        matcher = SemanticSkillMatcher()
        
        job_skills = ["Java", "REST", "AWS", "CI/CD", "Mensageria"]
        resume_skills = ["Python", "Java", "Spring Boot", "Docker", "RabbitMQ"]
        resume_text = "Worked on REST APIs using FastAPI..."
        
        matches = matcher.match_skills(job_skills, resume_skills, resume_text)
        for m in matches:
            print(m.model_dump())
    """
    
    def __init__(
        self, 
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
        strong_threshold: float = 0.75,
        moderate_threshold: float = 0.60
    ):
        """
        Initialize the semantic skill matcher.
        
        Args:
            model_name: SentenceTransformer model to use
            strong_threshold: Similarity >= this = strong match
            moderate_threshold: Similarity >= this = moderate match
        """
        print(f"Loading embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.strong_threshold = strong_threshold
        self.moderate_threshold = moderate_threshold
        print("Model loaded successfully!")
    
    def match_skills(
        self,
        job_skills: list[str],
        resume_skills: list[str],
        resume_full_text: str = ""
    ) -> list[SkillMatch]:
        """
        Match job skills against resume using semantic embeddings.
        
        Args:
            job_skills: Skills required in job posting
            resume_skills: Explicit skills from resume
            resume_full_text: Full resume text for evidence search
        
        Returns:
            List of SkillMatch with confidence scores
        """
        matches = []
        
        # Pre-compute embeddings for all resume skills
        resume_skill_embeddings = (
            self.model.encode(resume_skills, convert_to_tensor=True) 
            if resume_skills else None
        )
        
        # Embed full resume text for fallback evidence search
        resume_text_embedding = (
            self.model.encode(resume_full_text, convert_to_tensor=True)
            if resume_full_text else None
        )
        
        for job_skill in job_skills:
            match = SkillMatch(
                skill_name=job_skill,
                canonical_name="",
                match_type="none",
                is_matched=False,
                confidence_score=0.0,
                evidence_source=""
            )
            
            job_skill_lower = job_skill.lower()
            
            # 1. Check exact match first (fastest)
            for resume_skill in resume_skills:
                if resume_skill.lower() == job_skill_lower:
                    match.canonical_name = resume_skill
                    match.match_type = "exact"
                    match.is_matched = True
                    match.confidence_score = 1.0
                    match.evidence_source = "resume_skills"
                    break
            
            # 2. If no exact match, try semantic matching against resume skills
            if not match.is_matched and resume_skill_embeddings is not None:
                job_skill_embedding = self.model.encode(job_skill, convert_to_tensor=True)
                similarities = util.cos_sim(job_skill_embedding, resume_skill_embeddings)[0]
                
                best_idx = int(torch.argmax(similarities))
                best_score = float(similarities[best_idx])
                
                if best_score >= self.moderate_threshold:
                    match.canonical_name = resume_skills[best_idx]
                    match.match_type = "semantic"
                    match.is_matched = True
                    match.confidence_score = round(best_score, 3)
                    match.evidence_source = "resume_skills"
            
            # 3. Fallback: Check if skill is mentioned in full resume text
            if not match.is_matched and resume_text_embedding is not None:
                job_skill_embedding = self.model.encode(job_skill, convert_to_tensor=True)
                text_similarity = float(
                    util.cos_sim(job_skill_embedding, resume_text_embedding)[0][0]
                )
                
                # Lower threshold for text evidence (less precise)
                # Also check if the skill term appears directly in the text
                skill_in_text = job_skill.lower() in resume_full_text.lower()
                if text_similarity >= self.moderate_threshold * 0.75 or skill_in_text:
                    match.canonical_name = "(found in resume text)" if skill_in_text else "(inferred from experience)"
                    match.match_type = "text_evidence"
                    match.is_matched = True
                    match.confidence_score = round(text_similarity, 3)
                    match.evidence_source = "resume_text"
            
            matches.append(match)
        
        return matches
    
    def compare_skills(
        self, 
        skill1: str, 
        skill2: str
    ) -> float:
        """
        Compare two skills and return their semantic similarity.
        
        Useful for debugging/tuning thresholds.
        """
        emb1 = self.model.encode(skill1, convert_to_tensor=True)
        emb2 = self.model.encode(skill2, convert_to_tensor=True)
        return float(util.cos_sim(emb1, emb2)[0][0])


# Convenience function for quick usage
def match_skills_semantic(
    job_skills: list[str],
    resume_skills: list[str],
    resume_full_text: str,
    matcher: SemanticSkillMatcher
) -> list[SkillMatch]:
    """
    Convenience wrapper for SemanticSkillMatcher.match_skills().
    
    Args:
        job_skills: Skills required in job posting
        resume_skills: Explicit skills from resume
        resume_full_text: Full resume text for evidence search
        matcher: SemanticSkillMatcher instance
    
    Returns:
        List of SkillMatch with confidence scores
    """
    return matcher.match_skills(job_skills, resume_skills, resume_full_text)
