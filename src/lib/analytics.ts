export type AnalyticsPayloadByEvent = {
  demo_layer_selected: { layer: string };
  demo_module_selected: { module: string };
  demo_played: undefined;
  faq_item_opened: { question: string };
  final_cta_clicked: undefined;
  hero_primary_cta_clicked: undefined;
  hero_secondary_cta_clicked: undefined;
  mobile_nav_primary_cta_clicked: undefined;
  nav_brand_clicked: undefined;
  nav_primary_cta_clicked: undefined;
};

export type AnalyticsEventName = keyof AnalyticsPayloadByEvent;

export type EmptyAnalyticsEventName = {
  [EventName in AnalyticsEventName]: AnalyticsPayloadByEvent[EventName] extends undefined
    ? EventName
    : never;
}[AnalyticsEventName];

export type PayloadAnalyticsEventName = Exclude<
  AnalyticsEventName,
  EmptyAnalyticsEventName
>;

export function track<EventName extends EmptyAnalyticsEventName>(
  eventName: EventName,
): void;
export function track<EventName extends PayloadAnalyticsEventName>(
  eventName: EventName,
  payload: AnalyticsPayloadByEvent[EventName],
): void;
export function track(
  eventName: AnalyticsEventName,
  payload?: AnalyticsPayloadByEvent[AnalyticsEventName],
) {
  window.dispatchEvent(
    new CustomEvent("brandy:analytics", {
      detail: {
        eventName,
        payload: payload ?? {},
      },
    }),
  );
}
