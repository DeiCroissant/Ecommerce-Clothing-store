"""
Content-Based Filtering Recommendation System
Sử dụng TF-IDF và Cosine Similarity để gợi ý sản phẩm tương tự

Author: Vyron Fashion
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Optional
import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)


class ProductRecommender:
    """
    Content-Based Filtering Recommender sử dụng TF-IDF + Cosine Similarity
    
    Workflow:
    1. Load tất cả sản phẩm từ database
    2. Tạo "content" từ name + description + category + colors
    3. Chuyển content thành TF-IDF vectors
    4. Tính Cosine Similarity matrix
    5. Khi cần gợi ý, tìm top N sản phẩm có similarity cao nhất
    """
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),      # Unigram + Bigram
            min_df=1,                 # Minimum document frequency
            max_df=0.95,              # Maximum document frequency (loại bỏ từ quá phổ biến)
            lowercase=True,
            strip_accents=None,       # Giữ nguyên tiếng Việt có dấu
            token_pattern=r'(?u)\b\w+\b'  # Hỗ trợ Unicode
        )
        
        self.tfidf_matrix = None
        self.product_ids: List[str] = []
        self.product_data: Dict[str, dict] = {}  # Cache product info
        self.similarity_matrix = None
        self.is_fitted = False
        self.last_updated: Optional[datetime] = None
        self._lock = asyncio.Lock()
        
    def _build_content(self, product: dict) -> str:
        """
        Xây dựng nội dung văn bản từ thông tin sản phẩm
        
        Kết hợp nhiều trường để tạo "profile" cho sản phẩm:
        - Tên sản phẩm (weight cao - lặp lại 3 lần)
        - Mô tả ngắn
        - Category (weight cao - lặp lại 2 lần)
        - Brand
        - Màu sắc
        """
        parts = []
        
        # Tên sản phẩm (weight cao)
        name = product.get('name', '')
        if name:
            parts.extend([name] * 3)  # Lặp 3 lần để tăng weight
        
        # Mô tả ngắn
        description = product.get('short_description', '')
        if description:
            parts.append(description)
        
        # Category (weight cao)
        category = product.get('category', {})
        if isinstance(category, dict):
            category_name = category.get('name', '')
            if category_name:
                parts.extend([category_name] * 2)  # Lặp 2 lần
        
        # Brand
        brand = product.get('brand', {})
        if isinstance(brand, dict):
            brand_name = brand.get('name', '')
            if brand_name:
                parts.append(brand_name)
        
        # Màu sắc từ variants
        variants = product.get('variants', {})
        if isinstance(variants, dict):
            colors = variants.get('colors', [])
            if colors:
                for color in colors:
                    if isinstance(color, dict):
                        color_name = color.get('name', '')
                        if color_name:
                            parts.append(color_name)
        
        # Kết hợp thành một chuỗi
        content = ' '.join(parts)
        return content.strip()
    
    async def fit(self, products: List[dict]) -> bool:
        """
        Train model với danh sách sản phẩm
        
        Args:
            products: List các product documents từ MongoDB
            
        Returns:
            True nếu thành công, False nếu thất bại
        """
        async with self._lock:
            try:
                if not products:
                    logger.warning("No products to fit recommender")
                    return False
                
                logger.info(f"🧠 Fitting recommender with {len(products)} products...")
                
                # Reset data
                self.product_ids = []
                self.product_data = {}
                contents = []
                
                # Chỉ xử lý sản phẩm active
                active_products = [p for p in products if p.get('status', 'active') == 'active']
                
                if len(active_products) < 2:
                    logger.warning("Need at least 2 active products for recommendations")
                    self.is_fitted = False
                    return False
                
                for product in active_products:
                    product_id = str(product.get('_id', ''))
                    if not product_id:
                        continue
                    
                    content = self._build_content(product)
                    if not content:
                        continue
                    
                    self.product_ids.append(product_id)
                    self.product_data[product_id] = {
                        'id': product_id,
                        'name': product.get('name', ''),
                        'slug': product.get('slug', ''),
                        'image': product.get('image', ''),
                        'pricing': product.get('pricing', {}),
                        'category': product.get('category', {}),
                        'rating': product.get('rating', {'average': 0, 'count': 0})
                    }
                    contents.append(content)
                
                if len(contents) < 2:
                    logger.warning("Not enough valid content for recommendations")
                    self.is_fitted = False
                    return False
                
                # Fit TF-IDF
                self.tfidf_matrix = self.vectorizer.fit_transform(contents)
                
                # Tính Cosine Similarity matrix
                # Sử dụng sparse matrix để tiết kiệm memory
                self.similarity_matrix = cosine_similarity(self.tfidf_matrix)
                
                self.is_fitted = True
                self.last_updated = datetime.now()
                
                logger.info(f"✅ Recommender fitted successfully!")
                logger.info(f"   - Products: {len(self.product_ids)}")
                logger.info(f"   - TF-IDF features: {self.tfidf_matrix.shape[1]}")
                logger.info(f"   - Matrix size: {self.similarity_matrix.shape}")
                
                return True
                
            except Exception as e:
                logger.error(f"❌ Error fitting recommender: {str(e)}")
                self.is_fitted = False
                return False
    
    def get_recommendations(
        self, 
        product_id: str, 
        n: int = 8,
        min_similarity: float = 0.1
    ) -> List[dict]:
        """
        Lấy N sản phẩm tương tự nhất
        
        Args:
            product_id: ID sản phẩm cần tìm gợi ý
            n: Số lượng sản phẩm gợi ý (default: 8)
            min_similarity: Ngưỡng similarity tối thiểu (default: 0.1)
            
        Returns:
            List các sản phẩm tương tự với score
        """
        if not self.is_fitted:
            logger.warning("Recommender not fitted yet")
            return []
        
        if product_id not in self.product_ids:
            logger.warning(f"Product {product_id} not found in recommender")
            return []
        
        try:
            # Tìm index của product
            idx = self.product_ids.index(product_id)
            
            # Lấy similarity scores cho product này
            similarity_scores = self.similarity_matrix[idx]
            
            # Tạo list (index, score) và sort theo score giảm dần
            scored_indices = list(enumerate(similarity_scores))
            scored_indices.sort(key=lambda x: x[1], reverse=True)
            
            recommendations = []
            for i, score in scored_indices:
                # Bỏ qua chính sản phẩm đó
                if i == idx:
                    continue
                
                # Chỉ lấy sản phẩm có similarity >= min_similarity
                if score < min_similarity:
                    continue
                
                rec_product_id = self.product_ids[i]
                product_info = self.product_data.get(rec_product_id, {})
                
                recommendations.append({
                    **product_info,
                    'similarity_score': round(float(score), 4)
                })
                
                if len(recommendations) >= n:
                    break
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []
    
    def get_recommendations_by_content(
        self,
        content: str,
        n: int = 8,
        exclude_ids: List[str] = None
    ) -> List[dict]:
        """
        Lấy gợi ý dựa trên nội dung văn bản (cho search/filter)
        
        Args:
            content: Nội dung văn bản để tìm kiếm
            n: Số lượng kết quả
            exclude_ids: List ID sản phẩm cần loại trừ
            
        Returns:
            List sản phẩm tương tự
        """
        if not self.is_fitted:
            return []
        
        try:
            # Transform content thành vector
            content_vector = self.vectorizer.transform([content])
            
            # Tính similarity với tất cả sản phẩm
            similarities = cosine_similarity(content_vector, self.tfidf_matrix)[0]
            
            # Sort và lấy top N
            scored_indices = list(enumerate(similarities))
            scored_indices.sort(key=lambda x: x[1], reverse=True)
            
            exclude_ids = exclude_ids or []
            recommendations = []
            
            for i, score in scored_indices:
                product_id = self.product_ids[i]
                
                if product_id in exclude_ids:
                    continue
                
                if score < 0.05:  # Minimum threshold
                    continue
                
                product_info = self.product_data.get(product_id, {})
                recommendations.append({
                    **product_info,
                    'similarity_score': round(float(score), 4)
                })
                
                if len(recommendations) >= n:
                    break
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in content-based search: {str(e)}")
            return []
    
    def mark_dirty(self):
        """
        Đánh dấu cần rebuild model (khi có thay đổi sản phẩm)
        """
        self.is_fitted = False
        logger.info("📌 Recommender marked as dirty, needs rebuild")
    
    def get_stats(self) -> dict:
        """Lấy thống kê về recommender"""
        return {
            'is_fitted': self.is_fitted,
            'total_products': len(self.product_ids),
            'total_features': self.tfidf_matrix.shape[1] if self.tfidf_matrix is not None else 0,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }


# Singleton instance
recommender = ProductRecommender()
