// This allows importing terraform files as a module in typescript without type errors.
// The actual conversion is done by the @hekto/cloud-spec-terraform package via a jest transformer.
declare module '*.tf' {
  import { TerraformConfig } from '@hekto/cloud-spec-terraform';
  const Schema: TerraformConfig;
  export default Schema;
}