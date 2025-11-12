import React, { useState, useEffect } from 'react';

/**
 * CSVPreview Component
 * Displays first 10 rows of uploaded CSV data with column headers
 */
const CSVPreview = ({ data, title = 'CSV Preview', maxRows = 10 }) => {
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      // Extract headers from first row
      const firstRow = data[0];
      if (typeof firstRow === 'object') {
        setHeaders(Object.keys(firstRow));
      }

      // Get preview rows (first maxRows)
      const preview = data.slice(0, maxRows);
      setPreviewData(preview);
    } else {
      setPreviewData([]);
      setHeaders([]);
    }
  }, [data, maxRows]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-4">No data to preview</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">
          Showing {previewData.length} of {data.length} rows
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[header] !== null && row[header] !== undefined
                      ? String(row[header])
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          ... and {data.length - maxRows} more rows
        </div>
      )}
    </div>
  );
};

export default CSVPreview;

