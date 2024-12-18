// Copyright Epic Games, Inc. All Rights Reserved.

import { FlagsIds, OptionIds } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.5';

export class ExtraFlags {
    static LightMode = 'LightMode' as const;
}

export type ExtraFlagsKeys = Exclude<keyof typeof ExtraFlags, 'prototype'>;
export type ExtraFlagsIds = (typeof ExtraFlags)[ExtraFlagsKeys];

export type FlagsIdsExtended = FlagsIds | ExtraFlagsIds;

export type OptionIdsExtended = OptionIds | ExtraFlagsIds;

/** Whether a stream UI element is internally made, externally provided, or disabled. */
export enum UIElementCreationMode {
    CreateDefaultElement,
    UseCustomElement,
    Disable
}

/** A configuration for different UI elements which control/display info related to the stream. */
export type UIElementConfig = {
    // In which way is this element created?
    creationMode: UIElementCreationMode;
    // (Only relevant if when mode is CreateCustomElement) Visualizing element
    customElement?: HTMLElement;
};

/**
 * Configures a general stream-related UI panel.
 * For example: is it created, and if it is, what kind of button is used to show/hide it.
 * This configuration is used for the settings panel and stats panel by default.
 *
 * Note: For cases where the panel needs to be created, but a button isn't needed,
 * the panel element can be placed anywhere in the DOM as needed (see Application class).
 */
export type PanelConfiguration = {
    // If panel is enabled, HTML elements for it will be created, and funtionality bound
    isEnabled: boolean;
    // (Only relevant if isEnabled) The type of the button to show/hide this panel
    visibilityButtonConfig?: UIElementConfig;
};

export function isPanelEnabled(config: PanelConfiguration | undefined): boolean {
    return !config || (!!config && config.isEnabled);
}

/**
 * Type for all settings and a boolean to represent whether this setting UI is enabled
 */
export type AllSettingsConfig = {
    [K in OptionIdsExtended]: boolean;
};

type SettingsConfiguration = {
    settingVisibility?: Partial<AllSettingsConfig>;
};

/**
 * Overriden panel configuration to include setting visibility for the settings panel
 */
export type SettingsPanelConfiguration = PanelConfiguration & SettingsConfiguration;

export function isSettingEnabled(
    config: SettingsPanelConfiguration | undefined,
    setting: OptionIdsExtended
): boolean {
    return (
        !config ||
        (!!config &&
            (!Object.prototype.hasOwnProperty.call(config.settingVisibility, setting) ||
                (Object.prototype.hasOwnProperty.call(config.settingVisibility, setting) &&
                    config.settingVisibility[setting])))
    );
}
