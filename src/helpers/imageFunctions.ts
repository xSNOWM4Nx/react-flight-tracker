export const svgToImageAsync = (svgPath: string, width: number, height: number) => {

  return new Promise<HTMLImageElement>(resolve => {

    const image = new Image(width, height);
    image.addEventListener('load', () => resolve(image));
    image.src = svgPath;
  });
}