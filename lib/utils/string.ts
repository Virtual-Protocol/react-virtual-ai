export const getQuotedTexts = (text: string) => {
  const pattern = /".*?"/g;

  let current;
  const ls: string[] = [];
  while ((current = pattern.exec(text)))
    ls.push(current?.[0]?.slice(1, (current?.[0]?.length ?? 0) - 1));
  return ls;
};
