'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ProductDetails({ product }) {
  const [openSection, setOpenSection] = useState('material');

  // Lấy attributes với fallback
  const attributes = product?.attributes || {};
  const policies = product?.policies || {};
  const sizeChart = product?.size_chart || [];

  const sections = [
    {
      id: 'material',
      title: 'Chất liệu & Thành phần',
      content: (
        <div className="space-y-3">
          {attributes.material && (
            <div>
              <p className="font-semibold text-gray-900">Thành phần:</p>
              <p className="text-gray-600">{attributes.material}</p>
            </div>
          )}
          {attributes.origin && (
            <div>
              <p className="font-semibold text-gray-900">Xuất xứ:</p>
              <p className="text-gray-600">{attributes.origin}</p>
            </div>
          )}
          {attributes.features && attributes.features.length > 0 && (
            <div>
              <p className="font-semibold text-gray-900 mb-2">Đặc tính:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {attributes.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          {!attributes.material && !attributes.origin && (!attributes.features || attributes.features.length === 0) && (
            <p className="text-gray-500">Chưa có thông tin về chất liệu và thành phần.</p>
          )}
        </div>
      )
    },
    {
      id: 'care',
      title: 'Hướng dẫn bảo quản',
      content: (
        <div className="space-y-3">
          {attributes.care && attributes.care.length > 0 ? (
            <>
              <ul className="space-y-2">
                {attributes.care.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Không sử dụng chất tẩy mạnh. Nên phơi trong bóng mát để giữ màu lâu hơn.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Chưa có hướng dẫn bảo quản.</p>
          )}
        </div>
      )
    },
    {
      id: 'policies',
      title: 'Chính sách đổi trả',
      content: (
        <div className="space-y-4">
          {policies.return_days ? (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Thời gian đổi trả:</h4>
              <p className="text-gray-600">Trong vòng {policies.return_days} ngày kể từ ngày nhận hàng</p>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Thời gian đổi trả:</h4>
              <p className="text-gray-600">Trong vòng 30 ngày kể từ ngày nhận hàng</p>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Điều kiện đổi trả:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng</li>
              <li>Sản phẩm không bị dơ bẩn, hư hỏng</li>
              <li>Còn đầy đủ phụ kiện kèm theo (nếu có)</li>
              <li>Có hóa đơn mua hàng</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Phí đổi trả:</h4>
            <p className="text-gray-600">
              {policies.warranty || 'Miễn phí đổi trả với lỗi từ nhà sản xuất. Phí vận chuyển 30.000₫ nếu đổi size/màu.'}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'size-chart',
      title: 'Bảng size',
      content: (
        <div className="space-y-4">
          {sizeChart.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vai (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ngực (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Eo (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dài (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sizeChart.map((size, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{size.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{size.shoulder}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{size.chest}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{size.waist}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{size.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Gợi ý:</strong> Nếu bạn ở giữa hai size, chúng tôi khuyên bạn nên chọn size lớn hơn để thoải mái hơn.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Chưa có bảng size cho sản phẩm này.</p>
          )}
        </div>
      )
    }
  ];

  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  return (
    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
      {sections.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <ChevronDownIcon
              className={`w-5 h-5 text-gray-500 transition-transform ${
                openSection === section.id ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {openSection === section.id && (
            <div className="px-6 py-4 bg-gray-50">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
