import React from 'react';
import { AttributeValue } from '../../types';

interface DynamicSpecsTableProps {
  attributes: AttributeValue[];
  sku?: string;
  modelNumber?: string;
}

export const DynamicSpecsTable: React.FC<DynamicSpecsTableProps> = ({ attributes, sku, modelNumber }) => {
  const visibleSpecs = attributes?.filter(a => a.show_in_specs) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
          Technical Specifications
        </h3>
      </div>

      <div className="divide-y divide-slate-100 text-sm">
        {sku && (
          <div className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3 hover:bg-slate-50/50 transition">
            <span className="font-medium text-slate-500">Item SKU</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">{sku}</span>
          </div>
        )}

        {modelNumber && (
          <div className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3 hover:bg-slate-50/50 transition">
            <span className="font-medium text-slate-500">Model Number</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">{modelNumber}</span>
          </div>
        )}

        {visibleSpecs.length > 0 ? (
          visibleSpecs.map((spec) => (
            <div key={spec.attribute_id} className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3 hover:bg-slate-50/50 transition">
              <span className="font-medium text-slate-500">{spec.attribute_name}</span>
              <span className="sm:col-span-2 font-semibold text-slate-800">
                {String(spec.value)}
                {spec.unit ? ` ${spec.unit}` : ''}
              </span>
            </div>
          ))
        ) : (
          <div className="px-5 py-4 text-xs text-slate-500 italic">
            Standard specifications verified upon store enquiry.
          </div>
        )}
      </div>
    </div>
  );
};
