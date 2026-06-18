import { Check } from "lucide-react";

type BeforeAfterProps = {
  before: string[];
  after: string[];
};

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="before-after">
      <div className="before-after__pane" data-tone="before">
        <p>One-off page</p>
        {before.map((item) => (
          <code key={item}>{item}</code>
        ))}
      </div>
      <div className="before-after__pane" data-tone="after">
        <p>Brandy page</p>
        {after.map((item) => (
          <span key={item}>
            <Check aria-hidden="true" size={16} />
            <code>{item}</code>
          </span>
        ))}
      </div>
    </div>
  );
}
