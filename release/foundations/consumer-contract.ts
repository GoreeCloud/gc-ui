/** Compiled from a separately installed tarball: supported stable-scope types. */
import {
 GC_UI_VERSION,GC_THEME_DEFAULTS,
 generateTheme,contrastRatio,
 normalizeTheme,resolveTheme,createThemeController,
 type GCThemeConfiguration,type GCResolvedTheme,type GCColorScheme
} from '@goreecloud/gc-ui';

const version:'1.0.0-rc.1'=GC_UI_VERSION;
const scheme:GCColorScheme=generateTheme('#2365AE','light');
const ratio:number=contrastRatio(scheme.roles.primary,scheme.roles.onPrimary);
const config:GCThemeConfiguration=normalizeTheme({mode:'auto',accent:'iris'});
const next:GCResolvedTheme=resolveTheme(config,{forcedColors:true});
const controller=createThemeController({storage:null});
controller.set({mode:next.mode});
controller.destroy();
void [version,ratio,GC_THEME_DEFAULTS];

// @ts-expect-error experimental component binding is not part of this package
import {initTabs} from '@goreecloud/gc-ui';

// @ts-expect-error unsupported legacy native-host helper not exported
import {createNativeHostClient} from '@goreecloud/gc-ui';
