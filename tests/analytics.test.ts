import { describe, expect, expectTypeOf, it } from "vitest";
import {
  track,
  type AnalyticsEventName,
  type AnalyticsPayloadByEvent,
} from "../src/lib/analytics";

describe("analytics contract", () => {
  it("dispatches empty-payload analytics events", () => {
    const events: Array<CustomEvent["detail"]> = [];
    window.addEventListener("brandy:analytics", (event) => {
      events.push((event as CustomEvent).detail);
    });

    track("demo_played");

    expect(events).toEqual([
      {
        eventName: "demo_played",
        payload: {},
      },
    ]);
  });

  it("dispatches required event payloads", () => {
    const events: Array<CustomEvent["detail"]> = [];
    window.addEventListener("brandy:analytics", (event) => {
      events.push((event as CustomEvent).detail);
    });

    track("faq_item_opened", { question: "Can sections be reordered?" });

    expect(events).toEqual([
      {
        eventName: "faq_item_opened",
        payload: { question: "Can sections be reordered?" },
      },
    ]);
  });

  it("keeps event names and payloads typed", () => {
    expectTypeOf<"demo_played">().toMatchTypeOf<AnalyticsEventName>();
    expectTypeOf<AnalyticsPayloadByEvent["demo_layer_selected"]>().toEqualTypeOf<{
      layer: string;
    }>();
  });
});
