import Vue from 'vue';
import 'vuetify/types/lib';

declare module 'vue' {
  export interface GlobalComponents {
    VAlert: typeof import('vuetify/lib')['VAlert'];
    VApp: typeof import('vuetify/lib')['VApp'];
    VAppBar: typeof import('vuetify/lib')['VAppBar'];
    VBtn: typeof import('vuetify/lib')['VBtn'];
    VCard: typeof import('vuetify/lib')['VCard'];
    VCardText: typeof import('vuetify/lib')['VCardText'];
    VCarousel: typeof import('vuetify/lib')['VCarousel'];
    VCarouselItem: typeof import('vuetify/lib')['VCarouselItem'];
    VCol: typeof import('vuetify/lib')['VCol'];
    VDialog: typeof import('vuetify/lib')['VDialog'];
    VDivider: typeof import('vuetify/lib')['VDivider'];
    VIcon: typeof import('vuetify/lib')['VIcon'];
    VImg: typeof import('vuetify/lib')['VImg'];
    VMain: typeof import('vuetify/lib')['VMain'];
    VOverlay: typeof import('vuetify/lib')['VOverlay'];
    VPagination: typeof import('vuetify/lib')['VPagination'];
    VProgressCircular: typeof import('vuetify/lib')['VProgressCircular'];
    VProgressLinear: typeof import('vuetify/lib')['VProgressLinear'];
    VRow: typeof import('vuetify/lib')['VRow'];
    VSelect: typeof import('vuetify/lib')['VSelect'];
    VSpacer: typeof import('vuetify/lib')['VSpacer'];
    VTextField: typeof import('vuetify/lib')['VTextField'];
    RouterLink: typeof Vue;
    RouterView: typeof Vue;
  }
}
