# Integration Go-Live Checklist

**Authoritative reference:** `Mayflower_01_Master_Project_Brief.md` §11 & Phase 8 Implementation.

This checklist documents the exact technical prerequisites required to flip integration providers from `mocked` mode to `live` mode when Mayflower management provides third-party decisions and credentials.

---

## 1. Petpooja (POS Integration)

- [ ] **Client Decision**: Confirm whether Petpooja live sync is required for Phase 1 or Phase 2.
- [ ] **API Access Credentials**: Obtain App Key, Access Token, and Restaurant API secret key from Petpooja Developer Portal.
- [ ] **Endpoint Mapping**:
  - [ ] Daily Sales: Map Petpooja sales report API to `PetpoojaSalesSummary`.
  - [ ] Inventory: Map Petpooja stock level webhook/polling API to `PetpoojaInventoryItem`.
  - [ ] Orders: Map Petpooja live order webhook to `PetpoojaOrder`.
- [ ] **Environment Secret Setup**: Store `PETPOOJA_API_KEY` and `PETPOOJA_APP_SECRET` in Supabase Secrets / Vercel Environment Variables.
- [ ] **Adapter Code**: Implement `LivePetpoojaAdapter` implementing `PetpoojaAdapter` in `/src/modules/integrations/adapters/live-petpooja.adapter.ts`.
- [ ] **Config Switch**: Set `integration_configs` row for provider `petpooja` to `mode = 'live'`.

---

## 2. Loyalty Provider

- [ ] **Client Decision**: Finalize third-party loyalty program vendor choice.
- [ ] **API Documentation**: Obtain API spec for customer balance queries, points accrual, and redemption endpoints.
- [ ] **Authentication**: Obtain OAuth2 client credentials or API keys.
- [ ] **Adapter Code**: Implement `LiveLoyaltyAdapter` implementing `LoyaltyAdapter`.
- [ ] **Config Switch**: Set `integration_configs` row for provider `loyalty` to `mode = 'live'`.

---

## 3. CCTV Monitoring

- [ ] **Hardware & Network Audit**: Inspect existing DVR/NVR camera hardware model, RTSP/HLS stream URLs, and local IP / VPN access.
- [ ] **Stream Transcoding**: Set up HLS/WebRTC streaming proxy server (e.g. MediaMTX or AWS Kinesis Video Streams) if RTSP feeds require browser-compatible streaming.
- [ ] **Adapter Code**: Implement `LiveCctvAdapter` implementing `CctvAdapter`.
- [ ] **Config Switch**: Set `integration_configs` row for provider `cctv` to `mode = 'live'`.
