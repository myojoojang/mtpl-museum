import type Vue from 'vue';
import 'vuetify/types/lib';
import type * as VuetifyComponents from 'vuetify/lib';

declare module 'vue' {
  export interface GlobalComponents {
    VAlert: typeof VuetifyComponents.VAlert;
    VApp: typeof VuetifyComponents.VApp;
    VAppBar: typeof VuetifyComponents.VAppBar;
    VBtn: typeof VuetifyComponents.VBtn;
    VCard: typeof VuetifyComponents.VCard;
    VCardText: typeof VuetifyComponents.VCardText;
    VCarousel: typeof VuetifyComponents.VCarousel;
    VCarouselItem: typeof VuetifyComponents.VCarouselItem;
    VCol: typeof VuetifyComponents.VCol;
    VDialog: typeof VuetifyComponents.VDialog;
    VDivider: typeof VuetifyComponents.VDivider;
    VIcon: typeof VuetifyComponents.VIcon;
    VImg: typeof VuetifyComponents.VImg;
    VMain: typeof VuetifyComponents.VMain;
    VOverlay: typeof VuetifyComponents.VOverlay;
    VProgressCircular: typeof VuetifyComponents.VProgressCircular;
    VRow: typeof VuetifyComponents.VRow;
    VSelect: typeof VuetifyComponents.VSelect;
    VSpacer: typeof VuetifyComponents.VSpacer;
    VTextField: typeof VuetifyComponents.VTextField;
    RouterLink: typeof Vue;
    RouterView: typeof Vue;
  }
}
