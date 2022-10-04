import { Hash } from "./hash.ts";

export class Balloon {
  private static readonly algo = 'SHA-256';

  /**
   *
   * @param input The main string to hash
   * @param algo The algorithm to be used
   * @param salt A user defined random value for security
   * @param space_cost The size of the buffer
   * @param time_cost Number of rounds to mix
   * @param delta The number of random blocks to mix with
   * @returns string The resulting hash in hexadecimal format
   */
  public static async balloon(input: string, salt: string, space_cost: number = 16, time_cost: number = 20, delta: number = 3) {
    // Create our initial buffer
    let buf = [
      (await Balloon.doHash(0, input, salt)).hex(),
    ];

    // Set our counter to 1
    let counter = 1;

    // Expand our buffer
    counter = await Balloon.expand(buf, counter, space_cost);

    // Mix, mix, swirl mix.
    await Balloon.mix(buf, counter, delta, salt, space_cost, time_cost);

    //const h = new Hash(`${salt}${input}`, Balloon.algo);
    //await h.digest()
    //return h.hex();
    return Balloon.extract(buf);
  }

  private static async doHash(...args: any[]) {
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

    const h = new Hash(new Uint8Array(t), Balloon.algo);
    await h.digest();
    return h;
  }


  private static async expand(buffer: string[], counter: number, space_cost: number): Promise<number> {
    for(let s = 1; s < space_cost; s++) {
      buffer.push((await Balloon.doHash(counter, Balloon.hexToBytes(buffer[s - 1]))).hex());
      counter++;
    }
    return counter;
  }

  private static async mix(buffer: string[], counter: number, delta: number, salt: string, space_cost: number, time_cost: number) {
    for(let t = 0; t < time_cost; t++) {
      for(let s = 0; s < space_cost; s++) {
        if(typeof buffer.at(s-1) === 'undefined' || typeof buffer.at(s) === 'undefined') {
          throw Error('Buffer too short! (this is a bug!)');
        }
        buffer[s] = (await Balloon.doHash(counter, Balloon.hexToBytes(buffer.at(s-1)!), Balloon.hexToBytes(buffer.at(s)!))).hex();
        counter++;
        for(let i = 0; i < delta; i++) {
          const idx_block = (await Balloon.doHash(t, s, i)).hex();
          const h = await Balloon.doHash(counter, salt, Balloon.hexToBytes(idx_block));
          const other = Number(Balloon.toNumber(h.bytes()) % BigInt(space_cost));
          counter++;
          buffer[s] = (await Balloon.doHash(counter, Balloon.hexToBytes(buffer[s]), Balloon.hexToBytes(buffer[other]))).hex();
          counter++;
        }
      }
    }
  }

  private static extract(buffer: string[]) {
    return buffer.at(-1);
  }

  private static hexToBytes(hex: string) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return new Uint8Array(bytes);
  }

  private static toBytes(number: number) {
    // we want to represent the input as an 8-bytes array
    const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

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
