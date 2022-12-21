# @hekto/cloud-spec-aws-cdk

## 0.0.10

### Patch Changes

- 02036de: Allow to adjust timeouts for deploying / destroying the test stack

## 0.0.9

### Patch Changes

- 6140b27: Tag all resources, not only the stack. This allows cleaning up implicit resources like cloudwatch log groups
- 14774b5: Make destroying of stacks work via env or `forceDestroy` option

## 0.0.8

### Patch Changes

- 923e3c4: Group cfn stacks visually by providing project name as part of the name

## 0.0.7

### Patch Changes

- bd53468: Set GitRefName as Cfn tag. Will be useful for automatically tearing down stacks related to branches or pull requests

## 0.0.6

### Patch Changes

- c8dcc06: Streamline output handling. Less typing, less mapping
- dbd504d: Make sure the testApp helper is usable in multiple files in the same directory

## 0.0.5

### Patch Changes

- fe13dd4: Proper publishing

## 0.0.4

### Patch Changes

- a6da68c: Drop obsolete file

## 0.0.3

### Patch Changes

- eee89d1: Fixed log
