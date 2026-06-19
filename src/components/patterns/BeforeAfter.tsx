type BeforeAfterProps = {
  before: string[];
  after: string[];
};

export function BeforeAfter(_props: BeforeAfterProps) {
  void _props;

  return <div className="before-after" aria-hidden="true" />;
}
