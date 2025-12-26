import { router, usePage } from "@inertiajs/react";
import { lightFormat } from "date-fns";
import * as React from "react";

import { AudienceDataByDate } from "$app/data/audience";

import { AnalyticsLayout } from "$app/components/Analytics/AnalyticsLayout";
import { useAnalyticsDateRange } from "$app/components/Analytics/useAnalyticsDateRange";
import { AudienceChart } from "$app/components/Audience/AudienceChart";
import { AudienceQuickStats } from "$app/components/Audience/AudienceQuickStats";
import { Button } from "$app/components/Button";
import { DateRangePicker } from "$app/components/DateRangePicker";
import { ExportSubscribersPopover } from "$app/components/Followers/ExportSubscribersPopover";
import { Icon } from "$app/components/Icons";
import { LoadingSpinner } from "$app/components/LoadingSpinner";
import { Popover } from "$app/components/Popover";
import { showAlert } from "$app/components/server-components/Alert";
import Placeholder from "$app/components/ui/Placeholder";
import { WithTooltip } from "$app/components/WithTooltip";

import placeholder from "$assets/images/placeholders/audience.png";

type AudienceProps = {
  total_follower_count: number;
  audience_data: AudienceDataByDate | null;
};

export default function AudiencePage() {
  const { total_follower_count, audience_data } = usePage<AudienceProps>().props;
  const dateRange = useAnalyticsDateRange();
  const startTime = lightFormat(dateRange.from, "yyyy-MM-dd");
  const endTime = lightFormat(dateRange.to, "yyyy-MM-dd");
  const [isLoading, setIsLoading] = React.useState(false);
  const isInitialMount = React.useRef(true);

  const hasContent = total_follower_count > 0;

  React.useEffect(() => {
    // Skip initial mount - data is already loaded via Inertia props
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!hasContent) return;

    router.reload({
      only: ["audience_data"],
      data: { start_time: startTime, end_time: endTime },
      onStart: () => setIsLoading(true),
      onFinish: () => setIsLoading(false),
      onError: () => showAlert("Sorry, something went wrong. Please try again.", "error"),
    });
  }, [startTime, endTime, hasContent]);

  return (
    <AnalyticsLayout
      selectedTab="following"
      actions={
        hasContent ? (
          <>
            <Popover
              aria-label="Export"
              trigger={
                <WithTooltip tip="Export" position="bottom">
                  <Button aria-label="Export">
                    <Icon aria-label="Download" name="download" />
                  </Button>
                </WithTooltip>
              }
            >
              {(close) => <ExportSubscribersPopover closePopover={close} />}
            </Popover>
            <DateRangePicker {...dateRange} />
          </>
        ) : null
      }
    >
      {hasContent ? (
        <div className="space-y-8 p-4 md:p-8">
          <AudienceQuickStats
            totalFollowers={total_follower_count}
            newFollowers={audience_data?.new_followers ?? null}
          />
          {!isLoading && audience_data ? (
            <AudienceChart data={audience_data} />
          ) : (
            <div className="input">
              <LoadingSpinner />
              Loading charts...
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 md:p-8">
          <Placeholder>
            <figure>
              <img src={placeholder} />
            </figure>
            <h2>It's quiet. Too quiet.</h2>
            <p>
              You don't have any followers yet. Once you do, you'll see them here, along with powerful data that can
              help you keep your growing audience engaged.
            </p>
            <a href="/help/article/170-audience" target="_blank" rel="noreferrer">
              Learn more
            </a>
          </Placeholder>
        </div>
      )}
    </AnalyticsLayout>
  );
}
