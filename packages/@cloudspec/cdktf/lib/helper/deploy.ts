import { spawn, SpawnOptions } from 'child_process'
import * as path from 'path'
import { TestAppConfig } from '../app'
import * as fs from 'fs'

export const exec = async (
  command: string,
  args: string[],
  options: SpawnOptions,
  stdout?: (chunk: Buffer) => any,
  stderr?: (chunk: string | Uint8Array) => any,
): Promise<string> => {
  return new Promise((ok, ko) => {
    const child = spawn(command, args, options)
    const out = new Array<Buffer>()
    const err = new Array<string | Uint8Array>()
    if (stdout !== undefined) {
      child.stdout?.on('data', (chunk: Buffer) => {
        stdout(chunk)
      })
    } else {
      child.stdout?.on('data', (chunk: Buffer) => {
        out.push(chunk)
      })
    }
    if (stderr !== undefined) {
      child.stderr?.on('data', (chunk: string | Uint8Array) => {
        stderr(chunk)
      })
    } else {
      child.stderr?.on('data', (chunk: string | Uint8Array) => {
        process.stderr.write(chunk as string)
        err.push(chunk)
      })
    }
    child.once('error', (err: any) => ko(err))
    child.once('close', (code: number) => {
      if (code !== 0) {
        const error = new Error(`non-zero exit code ${code}`)
        ;(error as any).stderr = err.map((chunk) => chunk.toString()).join('')
        ;(error as any).stdout = out.map((chunk) => chunk.toString()).join('')
        return ko(error)
      }
      return ok(Buffer.concat(out).toString('utf-8'))
    })
  })
}

export const tfDeploy = async (testApp: TestAppConfig, force: boolean, verbose: boolean) => {
  const workDir = path.join(testApp.workDir);
  const args = [
    'apply',
    '-auto-approve',
    '-input=false',
    '-refresh=false'
  ]

  try {
    if (true || force) {
      await exec(
        'terraform',
        ['init', '-input=false'],
        { cwd: workDir },
        (chunk) => console.debug(chunk.toString()),
        (chunk) => console.error(chunk.toString()),
      );

      await exec(
        'terraform',
        args,
        { cwd: workDir },
        (chunk) => console.debug(chunk.toString()),
        (chunk) => console.error(chunk.toString()),
      )

      let outputs = ''
      await exec(
        'terraform',
        ['output', '-json'],
        { cwd: workDir },
        (chunk) => console.debug(outputs += chunk.toString()),
        (chunk) => console.error(chunk.toString()),
      );

      fs.writeFileSync(
        path.join(testApp.workDir, 'outputs.json'),
        outputs,
      );

      return JSON.parse(outputs)
    } else {
      console.log('Skipping deployment as config checksum is the same');
      return JSON.parse(fs.readFileSync(path.join(testApp.workDir, 'outputs.json'), 'utf-8'));
    }
  } catch (err) {
    console.error(err)
    return {}
  }
}

export const tfDestroy = async (testApp: TestAppConfig, verbose: boolean) => {
  const workDir = path.join(testApp.workDir);
  const args = ['destroy', '-auto-approve', '-input=false'];

  try {
    await exec(
      'terraform',
      args,
      { cwd: workDir },
      (chunk) => console.debug(chunk.toString()),
      (chunk) => console.error(chunk.toString()),
    )
  } catch (err) {
    console.error(err)
  }
}
