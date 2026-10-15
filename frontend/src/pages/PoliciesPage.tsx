import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, FileText, RotateCcw, Truck, Award, HelpCircle, AlertTriangle } from 'lucide-react';

const POLICIES = {
  privacy: {
    title: 'Privacy Notice',
    icon: Shield,
    content: `Bajaj Enterprises operates the retail bicycle showroom on Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India.

1. Information We Collect:
When you submit an online enquiry, schedule a store pickup, or request an order reservation, we collect your name, mobile number, email address (optional), and city address solely for the purpose of communicating with you regarding your bicycle requirements.

2. Usage of Information:
We do not sell, rent, or trade your contact information to third-party telemarketers or external advertising companies. Your details are used strictly by Bajaj Enterprises staff to respond to your specific enquiry or fulfill your requested bicycles.

3. Payment Security:
We do not process credit or debit card transactions directly on this website, nor do we store sensitive bank account details or card numbers. All monetary settlements occur securely in person at our Kote Gate showroom or through verified owner-provided UPI channels.

4. Data Rectification:
You may request the removal or update of your customer records by contacting our store manager directly.`
  },
  terms: {
    title: 'Terms of Use',
    icon: FileText,
    content: `1. Store Identity:
This web platform is published for Bajaj Enterprises, an authorized bicycle retailer in Bikaner, Rajasthan.

2. Product Listings & Pricing:
While we strive to maintain current pricing and technical specifications, all listings represent showroom inventory indicative of current manufacturer supplies. Certain models may display "Contact for price" or "Availability on enquiry". Prices and schemes are confirmed at the time of final order acknowledgement by the store manager.

3. Order Requests:
Submitting an order request through this website creates a provisional reservation. An order is confirmed only when our showroom staff verifies stock, completes mechanical inspection, and communicates confirmed fulfillment directly with the customer.

4. Demo Content Notice:
Demonstration listings explicitly labelled with "Demo Listing" are illustrative mock items provided for testing and preview purposes.

5. Jurisdiction:
Any disputes or claims related to transactions with Bajaj Enterprises shall be governed by the laws of India and subject to the jurisdiction of competent courts in Bikaner, Rajasthan.`
  },
  returns: {
    title: 'Returns & Cancellations',
    icon: RotateCcw,
    content: `1. Inspection Prior to Handover:
At Bajaj Enterprises, every bicycle undergoes frame check, brake calibration, tyre pressure verification, and gear tuning before handover at our Kote Gate showroom. We encourage all customers to inspect the bicycle thoroughly before riding away.

2. Order Request Cancellation:
Customers may cancel an online order request free of charge prior to final showroom dispatch or collection simply by notifying our team via phone or WhatsApp.

3. Returns & Exchange Policy:
Due to the mechanical nature of assembled bicycles, returns after showroom collection are accepted solely in cases of verified inherent manufacturing defects covered by the official manufacturer warranty (AVON, HERCULES). Wear-and-tear damages, road hazard punctures, and accidental impacts after delivery are excluded.`
  },
  shipping: {
    title: 'Store Pickup & Delivery',
    icon: Truck,
    content: `1. Showroom Collection (Recommended):
Free assembled collection is available at our flagship showroom on Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001. Our technicians will adjust the saddle height and handlebar alignment to your riding preference at no additional charge.

2. Local Bikaner Delivery:
For customers within Bikaner municipal limits, home delivery of fully assembled bicycles can be arranged upon store confirmation. Delivery timing and local cartage charges (if any) are confirmed prior to dispatch.

3. Out-of-Station Shipments:
For nearby towns in Rajasthan, boxed or semi-knocked-down (SKD) shipment can be arranged through local transport agencies upon request.`
  },
  warranty: {
    title: 'Warranty & Service Information',
    icon: Award,
    content: `1. Official Manufacturer Backing:
All brand-new bicycles sold by Bajaj Enterprises (including AVON and HERCULES) come with their respective manufacturer's limited warranty terms.

2. Frame Warranty:
Most rigid steel and alloy frames are covered against manufacturing welding defects for a period specified in the brand warranty booklet (typically 1 to 2 years, subject to manufacturer policy).

3. Excluded Components:
Tyres, tubes, brake pads, chain wear, cables, pedals, and consumable components experiencing regular friction wear are excluded from manufacturer warranty unless defective at initial delivery.

4. Warranty Claim Process:
To file a warranty claim, visit our Kote Gate showroom with your original purchase receipt and bicycle frame serial number.`
  },
  faq: {
    title: 'Frequently Asked Questions (FAQ)',
    icon: HelpCircle,
    content: `Q1: Where is Bajaj Enterprises showroom located?
A: We are conveniently located on Alakh Sagar Road, near Kote Gate, in Bikaner, Rajasthan 334001.

Q2: Are the bicycles assembled before delivery?
A: Yes. All bicycles collected from our showroom are assembled, calibrated, and tuned by experienced mechanics.

Q3: Do you stock AVON and HERCULES cycles?
A: Yes, we are an authorized dealer for AVON, HERCULES, and configurable premium bicycle brands.

Q4: Can I test ride a bicycle before buying?
A: Absolutely! We encourage customers and young riders to visit our showroom to test saddle height and frame geometry.

Q5: How does the online order request work?
A: Simply add your desired bicycles to the cart and submit an order request with your phone number. We will verify showroom stock and call you to confirm collection without requiring upfront card payments.`
  }
};

import { useSettings } from '../context/SettingsContext';

export const PoliciesPage: React.FC = () => {
  const { settings } = useSettings();
  const { policyType } = useParams<{ policyType?: string }>();
  const activeKey = (policyType && POLICIES[policyType as keyof typeof POLICIES]) ? policyType : 'privacy';
  const current = POLICIES[activeKey as keyof typeof POLICIES];
  const IconComponent = current.icon;

  // Dynamically resolve policy content from admin settings if provided
  let displayContent = current.content;
  if (activeKey === 'privacy' && settings.policy_privacy) {
    displayContent = settings.policy_privacy;
  } else if (activeKey === 'terms' && settings.policy_terms) {
    displayContent = settings.policy_terms;
  } else if (activeKey === 'returns' && settings.policy_returns) {
    displayContent = settings.policy_returns;
  } else if (activeKey === 'shipping' && settings.policy_delivery) {
    displayContent = settings.policy_delivery;
  } else if (activeKey === 'warranty' && settings.policy_warranty) {
    displayContent = settings.policy_warranty;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Draft Approval Warning Notice (Prompt Requirement) */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <strong>Store Policy Notice:</strong> Policies are maintained and authorized by the management of Bajaj Enterprises, Bikaner.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1 shadow-sm">
          <h3 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Policies & Customer Support
          </h3>
          {Object.entries(POLICIES).map(([key, item]) => {
            const ItemIcon = item.icon;
            const isSelected = activeKey === key;
            return (
              <Link
                key={key}
                to={`/policies/${key}`}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ItemIcon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Policy Content */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {current.title}
              </h1>
              <span className="text-xs text-slate-400">
                {settings.store_name || 'Bajaj Enterprises'} • {settings.store_address || 'Alakh Sagar Road, Kote Gate, Bikaner'}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4 font-normal">
            {displayContent}
          </div>
        </div>
      </div>
    </div>
  );
};
