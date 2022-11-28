import { spawn, SpawnOptions } from 'child_process'
import * as path from 'path'
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

export const cdkDeploy = async (appPath: string, cdkApp: string) => {
  try {
    const baseDir = appPath.split('/').slice(0, -1).join('/')

    await exec(
      'cdk',
      [
        'deploy',
        '--output',
        `${path.join(baseDir, 'cdk.out')}`,
        '--app',
        cdkApp,
        '--json',
        '--require-approval',
        'never',
        '--method',
        'direct',
        '--outputs-file',
        './outputs.json',
        '--hotswap',
      ],
      { cwd: baseDir },
      (chunk) => console.debug(chunk.toString()),
      (chunk) => console.error(chunk.toString()),
    )

    const outputs = JSON.parse(fs.readFileSync(path.join(baseDir, 'outputs.json'), 'utf8'))
    return outputs
  } catch (err) {
    console.error(err)
  }
}

export const cdkDestroy = async (appPath: string, cdkApp: string) => {
  try {
    const baseDir = appPath.split('/').slice(0, -1).join('/')

    await exec(
      'cdk',
      [
        'destroy',
        '--output',
        `${path.join(baseDir, 'cdk.out')}`,
        '--app',
        cdkApp,
        '--json',
        '--force',
      ],
      { cwd: baseDir },
      (chunk) => console.debug(chunk.toString()),
      (chunk) => console.error(chunk.toString()),
    )
  } catch (err) {
    console.error(err)
  }
}
