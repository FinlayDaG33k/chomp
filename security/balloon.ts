import { Hash } from "./hash.ts";
import { PASSWORD_DEFAULT } from "./password.ts";

export class Balloon {
  private buffer: Hash[] = [];
  private counter: number = 0;

  constructor(
    private readonly algorithm: string = PASSWORD_DEFAULT,
    private readonly space_cost: number = 1024,
    private readonly time_cost: number = 3,
    private readonly delta: number = 3
  ) {
  }

  /**
   * @returns string The resulting hash in hexadecimal format
   */
  public async execute(input: string, salt: string) {
    // Create our initial buffer
    this.buffer = [
      await this.doHash(this.counter++, input, salt),
    ];

    // Expand our buffer
    await this.expand();

    // Mix, mix, swirl mix.
    await this.mix(salt);

    // Extract the last hash from our buffer and return it
    return this.extract();
  }

  private async doHash(...args: any[]): Promise<Hash> {
    const t = [];

    for(const arg of args) {
      switch(typeof arg) {
        case 'string': {
          const encoded = new TextEncoder().encode(arg);
          for(const byte of encoded) {
            t.push(byte);
          }
          break;
        }
        case 'number': {
          for(const byte of Balloon.toBytes(arg)) {
            t.push(byte);
          }
          break;
        }
        default: {
          for(const byte of arg) {
            t.push(byte);
          }
        }
      }
    }

    const h = new Hash(new Uint8Array(t), this.algorithm);
    await h.digest();
    return h;
  }


  private async expand(): Promise<void> {
    for(let s = 1; s < this.space_cost; s++) {
      this.buffer.push(await this.doHash(this.counter, this.buffer[s - 1].bytes()));
      this.counter++;
    }
  }

  private async mix(salt: string): Promise<void> {
    for(let t = 0; t < this.time_cost; t++) {
      for(let s = 0; s < this.space_cost; s++) {
        if(typeof this.buffer.at(s-1) === 'undefined' || typeof this.buffer.at(s) === 'undefined') {
          throw Error('Buffer too short! (this is a bug!)');
        }
        this.buffer[s] = await this.doHash(this.counter, this.buffer.at(s-1)!.bytes(), this.buffer.at(s)!.bytes());
        this.counter++;
        for(let i = 0; i < this.delta; i++) {
          const idx_block = await this.doHash(t, s, i);
          const h = await this.doHash(this.counter, salt, idx_block.bytes());
          const other = Number(Balloon.toNumber(h.bytes()) % BigInt(this.space_cost));
          this.counter++;
          this.buffer[s] = await this.doHash(this.counter, this.buffer[s].bytes(), this.buffer[other].bytes());
          this.counter++;
        }
      }
    }
  }

  private extract(): string {
    return this.buffer.at(-1)!.hex();
  }

  private static toBytes(number: number): number[] {
    // we want to represent the input as an 8-bytes array
    const byteArray: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

    for(let i = 0; i < byteArray.length; i++) {
      const byte = number & 0xff;
      byteArray[i] = byte;
      number = (number - byte) / 256 ;
    }

    return byteArray;
  }

  private static toNumber(byteArray: any): bigint {
    byteArray = byteArray.reverse()
    return BigInt('0x' + byteArray.map((byte: any) => byte.toString(16).padStart(2, '0')).join(''));
  }
}
