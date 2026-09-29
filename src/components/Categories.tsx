import { categories } from '../data/jobs';

interface CategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function Categories({ selectedCategory, setSelectedCategory }: CategoriesProps) {
  return (
    <section id="categories" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            تصفح حسب التصنيف
          </h2>
          <p className="text-gray-500">اختر المجال الذي يناسب مهاراتك واهتماماتك</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                selectedCategory === cat.name
                  ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-100'
                  : 'border-gray-100 bg-white hover:border-teal-200'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-xs font-medium text-center leading-tight ${
                selectedCategory === cat.name ? 'text-teal-700' : 'text-gray-600'
              }`}>
                {cat.name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                selectedCategory === cat.name 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
