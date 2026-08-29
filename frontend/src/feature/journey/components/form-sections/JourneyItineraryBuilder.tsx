import React from "react";
import DayItineraryEditor from "@/components/shared/DayItineraryEditor";
import ListEditor from "@/components/shared/ListEditor";
import type { DayPlan } from "@/components/shared/DayItineraryEditor";

interface JourneyItineraryBuilderProps {
  formData: any;
  days: DayPlan[];
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
  inclusions: string[];
  setInclusions: React.Dispatch<React.SetStateAction<string[]>>;
  highlights: string[];
  setHighlights: React.Dispatch<React.SetStateAction<string[]>>;
  exclusions: string[];
  setExclusions: React.Dispatch<React.SetStateAction<string[]>>;
  whyChooseUs: string[];
  setWhyChooseUs: React.Dispatch<React.SetStateAction<string[]>>;
  bookingPolicyList: string[];
  setBookingPolicyList: React.Dispatch<React.SetStateAction<string[]>>;
  faqs: { ques: string; ans: string }[];
  setFaqs: React.Dispatch<React.SetStateAction<{ ques: string; ans: string }[]>>;
}

export default function JourneyItineraryBuilder({ 
  formData,
  days, setDays,
  inclusions, setInclusions,
  highlights, setHighlights,
  exclusions, setExclusions,
  whyChooseUs, setWhyChooseUs,
  bookingPolicyList, setBookingPolicyList,
  faqs, setFaqs
}: JourneyItineraryBuilderProps) {

  // Auto-sync days based on noDays input in formData
  React.useEffect(() => {
    setDays((prev) => {
      const num = Number(formData.noDays);
      const target = Number.isFinite(num) && num > 0 ? num : prev.length;
      if (target > prev.length) {
        const newDays = [...prev];
        for (let i = prev.length; i < target; i++) {
          newDays.push({ day: i + 1, title: `Day ${i + 1}`, content: "" });
        }
        return newDays;
      } else if (target < prev.length) {
        return prev.slice(0, target);
      }
      return prev;
    });
  }, [formData.noDays, setDays]);

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, key: "ques" | "ans", value: string) => {
    setFaqs(faqs.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const moveDay = (fromIdx: number, toIdx: number) => {
    setDays((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Day by Day Itinerary</h2>
        
        <div className="space-y-4">
          <DayItineraryEditor
            value={days}
            onChange={setDays}
          />
          {days.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">Increase "Number of Days" in General tab to add itinerary days.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Additional Information</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700">Highlights</h4>
            <ListEditor
              value={highlights}
              onChange={setHighlights}
              placeholder="Add a highlight..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700">Inclusions</h4>
            <ListEditor
              value={inclusions}
              onChange={setInclusions}
              placeholder="Add an inclusion..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700">Exclusions</h4>
            <ListEditor
              value={exclusions}
              onChange={setExclusions}
              placeholder="Add an exclusion..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700">Why Choose Us</h4>
            <ListEditor
              value={whyChooseUs}
              onChange={setWhyChooseUs}
              placeholder="Add a reason..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-700">Booking Policies</h4>
            <ListEditor
              value={bookingPolicyList}
              onChange={setBookingPolicyList}
              placeholder="Add a policy..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Frequently Asked Questions</h2>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="relative group flex flex-col">
              <button
                type="button"
                onClick={() => removeFaq(index)}
                className="absolute top-1.5 right-1.5 z-20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100"
              >
                REMOVE
              </button>
              
              <input
                value={faq.ques}
                onChange={(e) => updateFaq(index, "ques", e.target.value)}
                placeholder="Question (e.g. What is the best time to visit?)"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-t-lg bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors relative z-10 font-medium text-slate-800 placeholder:text-slate-400"
              />
              
              <textarea
                value={faq.ans}
                onChange={(e) => updateFaq(index, "ans", e.target.value)}
                rows={2}
                placeholder="Answer..."
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-b-lg border-t-0 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors relative z-0 text-slate-600 placeholder:text-slate-400"
              />
            </div>
          ))}
          {faqs.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-3 border border-dashed border-slate-300 rounded-lg">No FAQs added yet.</p>
          )}

          <button
            type="button"
            onClick={() => setFaqs([...faqs, { ques: "", ans: "" }])}
            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 font-medium hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
          >
            + Add FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
