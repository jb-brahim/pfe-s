'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { ArrowLeft, MoreHorizontal, ZoomIn, ZoomOut, Download, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const barData = [
  { name: 'Jan', value: 300 }, { name: 'Feb', value: 400 }, { name: 'Mar', value: 500 },
  { name: 'Apr', value: 600 }, { name: 'Sat', value: 450 }, { name: 'Sep', value: 550 }
];

const pieData = [
  { name: 'High', value: 90, color: '#D98F8F' },
  { name: 'Others', value: 10, color: '#1E0A0B' }
];

export default function InvoiceDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full pb-10 text-[#FFFFFF] min-h-full">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/invoices" className="p-2 bg-[rgba(255,255,255,0.05)] rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-white/10">
            <ArrowLeft size={20} className="text-[#A69697]" />
          </Link>
          <h1 className="text-[28px] font-medium tracking-tight">Invoice #TC-2023-10-15 Details</h1>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-[1.1fr_3fr] gap-6 items-stretch">
          
          {/* LEFT: Invoice Preview Panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-5 shadow-lg flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#FFFFFF] text-[16px] font-medium">Invoice Preview Panel</h3>
                <MoreHorizontal size={18} className="text-[#A69697] cursor-pointer" />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-[#A69697] text-[13px] mb-4">
                <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">Page</span>
                <span className="flex items-center gap-2">Page 10 <span className="cursor-pointer">&gt;</span></span>
                <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                  <span className="cursor-pointer px-1">-</span> Zoom <span className="cursor-pointer px-1">+</span>
                </div>
              </div>

              {/* PDF Mock Window */}
              <div className="flex-1 bg-gradient-to-b from-[#EBD8D8] to-[#C9A9A9] rounded-[16px] text-[#2D1B1C] p-6 relative shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF5C77] to-[#4ADE80] flex items-center justify-center font-bold text-white text-[12px]">A</div>
                    <span className="font-semibold text-[20px]">Aura</span>
                  </div>
                  <div className="text-right">
                    <h2 className="text-[24px] font-bold tracking-tight">Invoice</h2>
                    <p className="text-[13px] font-medium">#TC-2023-10-15</p>
                  </div>
                </div>

                <div className="flex justify-between text-[13px] font-medium mb-6">
                  <div>
                    <p className="text-[#6D071A]">Vecito None</p>
                    <p className="font-bold">Techcorp Solutions</p>
                    <p>666 Huele Soret</p>
                    <p>Address: C5000</p>
                  </div>
                  <div className="text-right">
                    <p>Invoice #TC-2023-10-15</p>
                    <p>Date: 15-Oct-2023</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between border-b border-[#2D1B1C]/20 pb-2 mb-3 text-[12px] font-bold bg-[#1E0A0B]/10 px-2 rounded">
                    <span>Itemized list</span>
                    <div className="flex gap-8">
                      <span>Amount</span>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px] px-2 mb-2">
                    <span>Server Racks</span>
                    <div className="flex gap-8">
                      <span className="w-12 text-right">5,000 TND</span>
                      <span className="w-12 text-right">5,000.00 TND</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px] px-2">
                    <span>Cable Management</span>
                    <div className="flex gap-8">
                      <span className="w-12 text-right">2,000 TND</span>
                      <span className="w-12 text-right">2,000.00 TND</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col items-end text-[13px]">
                  <div className="flex justify-between w-40 mb-1">
                    <span>Amount:</span>
                    <span className="font-medium">7,000.00 TND</span>
                  </div>
                  <div className="flex justify-between w-40 mb-2">
                    <span>Tax:</span>
                    <span className="font-medium">560.00 TND</span>
                  </div>
                  <div className="flex justify-between w-40 bg-[#1E0A0B]/80 text-[#EBD8D8] px-3 py-1.5 rounded-lg font-bold">
                    <span>Total:</span>
                    <span>7,560.00 TND</span>
                  </div>
                </div>

                {/* Bottom PDF Controls inside mock */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1A0A0B]/80 text-white/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-4 text-[12px] shadow-xl">
                  <span className="cursor-pointer">Page 1 &gt;</span>
                  <ZoomOut size={14} className="cursor-pointer" />
                  <ZoomIn size={14} className="cursor-pointer" />
                </div>
              </div>
            </div>

            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#EBD8D8] to-[#D98F8F] shadow-[0_0_20px_rgba(217,143,143,0.2)] font-semibold text-[15px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-[#1E0A0B]">
              <Download size={18} /> Download PDF Invoice
            </button>
          </div>

          {/* RIGHT: Main Dashboard Grid */}
          <div className="flex flex-col gap-4">
            
            {/* Top Row: Analytics & Tax */}
            <div className="grid grid-cols-3 gap-4">
              {/* Analytics: Total Amount */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Analytics: Total Amount</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="h-[90px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barSize={14} margin={{ bottom: -10 }}>
                      <XAxis dataKey="name" stroke="#A69697" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value === Math.max(...barData.map(d => d.value)) ? '#EBD8D8' : '#D98F8F'} opacity={0.8} />
                        ))}
                      </Bar>
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1A0A0B', border: 'none', borderRadius: '8px' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Analytics: Verification */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium truncate">Analytics: Verification Acc...</h3>
                  <MoreHorizontal size={16} className="text-[#A69697] flex-shrink-0" />
                </div>
                <div className="flex items-center justify-center gap-6 h-[100px]">
                  <div className="w-[80px] h-[80px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2 text-[12px]">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D98F8F]"></span> High (90%)</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8E1B3A]"></span> High (90%)</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#1A0A0B]"></span> Others</div>
                  </div>
                </div>
              </div>

              {/* Tax Details */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Tax Details</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="flex justify-between text-[12px] text-[#A69697] mb-2 border-b border-white/10 pb-2">
                  <span>Tax Line</span>
                  <span>Amount</span>
                  <span>Tax IDs</span>
                </div>
                <div className="flex justify-between text-[13px] mb-4 font-medium">
                  <span>Tax lines</span>
                  <span>700.00 TND</span>
                  <span>755002</span>
                </div>
                <div className="mt-auto flex items-center gap-2 text-[#4CAF50] text-[12px] font-medium">
                  <CheckCircle2 size={14} /> Tax Compliance Checked
                </div>
              </div>
            </div>

            {/* Middle Row: Extracted, Vendor, Signature */}
            <div className="grid grid-cols-3 gap-4">
              {/* Extracted Information */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Extracted Information</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="space-y-2 text-[13px] mb-4">
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Vendor</span> <span className="font-medium">Techcorp</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Date:</span> <span className="font-medium">15-Oct-2023</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Amount</span> <span className="font-medium">7,000.00 TND</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-[#A69697]">Tax</span> <span className="font-medium">560 TND</span></div>
                  <div className="flex justify-between pt-1 font-bold text-[14px]"><span>Total:</span> <span>7,560.00 TND</span></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-2 shadow-[inset_0_0_10px_rgba(76,175,80,0.1)]">
                    <CheckCircle2 size={14} /> Verification Status: Verified
                  </div>
                  <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-2 shadow-[inset_0_0_10px_rgba(76,175,80,0.1)]">
                    <CheckCircle2 size={14} /> AI Fraud Detection: Passed
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Vendor Information</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="text-[12px] text-[#A69697] flex-1 leading-relaxed">
                    <span className="font-bold text-white text-[13px]">Techcorp Solutions</span><br/>
                    666 Huele Stnet<br/>
                    Address: C5000<br/>
                    Contact:<br/>
                    (042) 882 3799
                  </div>
                  <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 p-3 rounded-[12px] flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-[#A69697] mb-1">Vendor Risk<br/>Assessment:</span>
                    <span className="text-[#4CAF50] font-bold text-[16px]">Low</span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#A69697] border-b border-white/10 pb-1 mb-1">
                  <span>Tax Line</span><span>Amount</span><span>Tax ID</span>
                </div>
                <div className="text-[12px] font-medium mb-3">
                  <div className="flex justify-between"><span className="text-[#A69697]">Tax Line</span><span>7,000.00 TND</span><span>-</span></div>
                  <div className="flex justify-between"><span className="text-[#A69697]">Tax ID</span><span>560.00 TND</span><span>-</span></div>
                  <div className="flex justify-between"><span className="text-[#A69697]">Tax IDs</span><span>7,560.00 TND</span><span>-</span></div>
                </div>
                <div className="flex items-center gap-2 text-[#4CAF50] text-[12px] font-medium mt-auto">
                  <CheckCircle2 size={14} /> Tax Compliance Checked
                </div>
              </div>

              {/* TTN Signature Status */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">TTN Digital Signature Status</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 rounded-[12px] p-4 flex flex-col gap-3 h-[180px] overflow-y-auto scrollbar-thin">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#4CAF50] mt-0.5" />
                    <div>
                      <p className="text-[#4CAF50] font-medium text-[13px]">Signature Valid</p>
                      <div className="ml-1 pl-3 border-l border-white/10 mt-1 pb-2">
                        <p className="text-[13px] font-medium text-white flex items-center gap-1.5 before:w-1.5 before:h-1.5 before:bg-[#D98F8F] before:rounded-full">Techcorp</p>
                        <p className="text-[11px] text-[#A69697]">TTN signatorp 2023-10-15</p>
                      </div>
                      <div className="ml-1 pl-3 border-l border-white/10 pb-1">
                        <p className="text-[13px] font-medium text-white flex items-center gap-1.5 before:w-1.5 before:h-1.5 before:bg-[#D98F8F] before:rounded-full">Aura</p>
                        <p className="text-[11px] text-[#A69697]">TTN signaturp 2023-10-15</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                    <CheckCircle2 size={16} className="text-[#4CAF50] mt-0.5" />
                    <div>
                      <p className="text-[#4CAF50] font-medium text-[13px] mb-1">Signature Valid</p>
                      <p className="text-[10px] text-[#A69697] leading-tight">
                        Signatunp: 15-Oct, 2023, 10:38 AM<br/>
                        Signatunp: 15-Oct, 2023, 10:38 PM<br/>
                        Signatunp: 15-Oct, 2023, 10:39 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Workflow & Comments */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* Approval Workflow */}
              <div className="col-span-2 bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Approval Workflow Timeline</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10 z-0"></div>
                  <div className="absolute top-4 left-4 w-1/2 h-0.5 bg-[#4CAF50] z-0"></div>

                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="bg-[#4CAF50]/10 border border-[#4CAF50] text-[#4CAF50] px-3 py-1.5 rounded-full text-[12px] font-medium mb-3 whitespace-nowrap shadow-[0_0_10px_rgba(76,175,80,0.2)]">1. Scan & Extract</div>
                      <div className="flex items-center gap-2">
                        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-8 h-8 rounded-full border border-white/20" />
                        <div className="text-[12px]">
                          <p className="font-medium text-white">Eleanor Pena</p>
                          <p className="text-[#A69697]">15-Oct</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="bg-[#4CAF50]/10 border border-[#4CAF50] text-[#4CAF50] px-3 py-1.5 rounded-full text-[12px] font-medium mb-3 whitespace-nowrap shadow-[0_0_10px_rgba(76,175,80,0.2)]">2. Dept. Verification</div>
                      <div className="flex items-center gap-2">
                        <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded-full border border-white/20" />
                        <div className="text-[12px]">
                          <p className="font-medium text-white">Ben Carter</p>
                          <p className="text-[#A69697]">16-Oct</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="bg-[#FFC107] border border-[#FFD54F] text-[#1E0A0B] px-3 py-1.5 rounded-full text-[12px] font-bold mb-3 whitespace-nowrap shadow-[0_0_15px_rgba(255,193,7,0.3)]">3. Final Approval</div>
                      <div className="flex items-center gap-2">
                        <img src="https://i.pravatar.cc/150?u=2" className="w-8 h-8 rounded-full border border-white/20" />
                        <div className="text-[12px]">
                          <p className="font-medium text-white flex items-center gap-1">Admin <span className="bg-[#D98F8F]/20 text-[#D98F8F] text-[10px] px-1.5 py-0.5 rounded ml-1 border border-white/10">Pending</span></p>
                          <p className="text-[#A69697]">15-Oct</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments & Notes */}
              <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#FFFFFF] text-[14px] font-medium">Comments and Notes</h3>
                  <MoreHorizontal size={16} className="text-[#A69697]" />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  <div className="flex gap-2">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-6 h-6 rounded-full" />
                    <div>
                      <p className="text-[13px] font-medium text-white flex items-center gap-2">Eleanor Pena <span className="text-[10px] text-[#A69697] font-normal">1 yeo ago</span></p>
                      <p className="text-[12px] text-[#A69697] bg-white/5 p-2 rounded-r-lg rounded-bl-lg mt-1 border border-white/5">I have addo new added notes fiove on this discusties.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <img src="https://i.pravatar.cc/150?u=3" className="w-6 h-6 rounded-full" />
                    <div>
                      <p className="text-[13px] font-medium text-white flex items-center gap-2">Adee-added <span className="text-[10px] text-[#A69697] font-normal">1 yew ago</span></p>
                      <p className="text-[12px] text-[#A69697] bg-white/5 p-2 rounded-r-lg rounded-bl-lg mt-1 border border-white/5">I vrew added notes to the aoot notes.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 relative">
                  <input type="text" placeholder="Add Note" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full py-2 pl-4 pr-24 text-[13px] text-white outline-none focus:border-[#D98F8F]/50 transition-colors placeholder:text-[#A69697]" />
                  <button className="absolute right-1 top-1 bottom-1 bg-[#EBD8D8] text-[#1E0A0B] px-4 rounded-full text-[12px] font-bold hover:opacity-90 transition-opacity">Add Note</button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-2 h-14">
              <button className="h-full rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.1)] transition-colors font-semibold text-[#D98F8F] shadow-lg hover:shadow-[#D98F8F]/10 text-[15px]">
                Request Re-check
              </button>
              <button className="h-full rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.12)] transition-colors font-semibold text-[#EBD8D8] shadow-lg hover:shadow-[#EBD8D8]/10 text-[15px]">
                Proceed to Payment
              </button>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
