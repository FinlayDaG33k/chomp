export function tokenizer(input: string, limit = 3) {
  const tokens = input.split(" ");
  if(tokens.length > limit) {
    let ret = tokens.splice(0, limit);
    ret.push(tokens.join(" "));
    return ret;
  }

  return tokens;
}
