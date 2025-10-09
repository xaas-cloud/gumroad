import React from "react";

import { DomainSettings } from "$app/types/domain_settings";
import { LoggedInUser, Seller } from "$app/types/user";

import { ClientAlertProvider } from "$app/components/ClientAlertProvider";
import { CurrentSellerProvider, parseCurrentSeller } from "$app/components/CurrentSeller";
import { DesignContextProvider, DesignSettings } from "$app/components/DesignSettings";
import { DomainSettingsProvider } from "$app/components/DomainSettings";
import { LoggedInUserProvider, parseLoggedInUser } from "$app/components/LoggedInUser";
import { SSRLocationProvider } from "$app/components/useOriginalLocation";
import { UserAgentProvider } from "$app/components/UserAgent";

type GlobalProps = {
  design_settings: DesignSettings;
  domain_settings: DomainSettings;
  user_agent_info: {
    is_mobile: boolean;
  };
  logged_in_user: LoggedInUser;
  current_seller: Seller;
  href: string;
  locale: string;
};

export default function AppWrapper({ children, global }: { children: React.ReactNode; global: GlobalProps }) {
  return (
    <DesignContextProvider value={global.design_settings}>
      <DomainSettingsProvider
        value={{
          scheme: global.domain_settings.scheme,
          appDomain: global.domain_settings.app_domain,
          rootDomain: global.domain_settings.root_domain,
          shortDomain: global.domain_settings.short_domain,
          discoverDomain: global.domain_settings.discover_domain,
          thirdPartyAnalyticsDomain: global.domain_settings.third_party_analytics_domain,
          apiDomain: global.domain_settings.api_domain,
        }}
      >
        <UserAgentProvider
          value={{
            isMobile: global.user_agent_info.is_mobile,
            locale: global.locale,
          }}
        >
          <LoggedInUserProvider value={parseLoggedInUser(global.logged_in_user)}>
            <CurrentSellerProvider value={parseCurrentSeller(global.current_seller)}>
              <SSRLocationProvider value={global.href}>
                <ClientAlertProvider>{children}</ClientAlertProvider>
              </SSRLocationProvider>
            </CurrentSellerProvider>
          </LoggedInUserProvider>
        </UserAgentProvider>
      </DomainSettingsProvider>
    </DesignContextProvider>
  );
}
