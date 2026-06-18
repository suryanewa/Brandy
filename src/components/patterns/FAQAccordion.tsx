import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { track } from "../../lib/analytics";
import type { FaqItem } from "../../types/landing";

type FAQAccordionProps = {
  items: FaqItem[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = index === openIndex;

        return (
          <div className="faq-item" data-open={isOpen} key={item.question}>
            <button
              aria-expanded={isOpen}
              className="faq-item__trigger"
              onClick={() => {
                setOpenIndex(isOpen ? -1 : index);
                if (!isOpen) {
                  track("faq_item_opened", { question: item.question });
                }
              }}
              type="button"
            >
              <span>{item.question}</span>
              <ChevronDown aria-hidden="true" size={18} />
            </button>
            <div className="faq-item__panel" hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
