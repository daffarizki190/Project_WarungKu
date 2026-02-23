// client/src/components/kasir/ProductCard.jsx — redesigned

import { Badge } from '../../lib/ui';
import { formatRupiah, getCategoryColor } from '../../lib/ui';

const ProductCard = ({ product, onAdd }) => {
  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => !isOut && onAdd(product)}
      className="bg-white rounded-3xl p-4 transition-all duration-200 select-none relative overflow-hidden group"
      style={{
        border: '1px solid rgba(196,162,120,0.2)',
        boxShadow: '0 2px 12px rgba(100,60,20,0.06)',
        cursor: isOut ? 'not-allowed' : 'pointer',
        opacity: isOut ? 0.55 : 1,
      }}
    >
      {/* Hover shimmer */}
      {!isOut && (
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-3xl pointer-events-none" />
      )}

      {/* Category pill */}
      <div className="mb-3">
        <span className={`pill text-[10px] font-bold tracking-wide ${getCategoryColor(product.category)}`}>
          {product.category}
        </span>
      </div>

      {/* Name */}
      <p className="font-body font-semibold text-sm text-ink leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
        {product.name}
      </p>

      {/* Price */}
      <p className="font-display font-bold text-terracotta text-lg leading-none mb-3">
        {formatRupiah(product.price)}
      </p>

      {/* Stock footer */}
      <div className="flex items-center justify-between pt-3 border-t border-sand">
        <p className={`text-xs font-medium ${isLow ? 'text-amber-600' : isOut ? 'text-red-500' : 'text-clay'}`}>
          Stok: {product.stock}
        </p>
        {isOut && <Badge variant="danger">Habis</Badge>}
        {isLow && <Badge variant="warning">Hampir habis</Badge>}
        {!isOut && !isLow && (
          <div className="w-6 h-6 rounded-lg bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta group-hover:text-white transition-all duration-200">
            <span className="text-xs font-bold text-terracotta group-hover:text-white">+</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
