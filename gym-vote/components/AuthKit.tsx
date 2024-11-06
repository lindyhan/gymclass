
"use client";

// Particle imports
import { arbitrumSepolia, optimismSepolia, baseSepolia, sepolia } from "@particle-network/authkit/chains"; // Chains are imported here
import { AuthType } from "@particle-network/auth-core";
import {
  AuthCoreContextProvider,
  PromptSettingType,
} from "@particle-network/authkit"; 

export const ParticleAuthkit = ({ children }: React.PropsWithChildren) => {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
        clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
        appId: process.env.NEXT_PUBLIC_APP_ID!,
        authTypes: [AuthType.email, AuthType.google, AuthType.twitter],
        themeType: "light",

        // List the chains you want to include
        chains: [arbitrumSepolia, optimismSepolia, baseSepolia, sepolia],

        promptSettingConfig: {
          promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
          promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
        },

        wallet: {
          themeType: "light",

          // Set to false to remove the embedded wallet modal
          visible: false,
          customStyle: {
            supportUIModeSwitch: true,
            supportLanguageSwitch: false,
          },
        },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
};

