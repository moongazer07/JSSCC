class BitmapFont {
    public chars: ImageData[];
    public charMap: string;

    public spaceBetweenLetters: number;
    public spaceWidth: number;
    public height: number;

    private static fontPalette: Palette = <Palette>{ foreground: "#000" };

    public constructor(imgCanvas: CanvasRenderingContext2D, charMap: string, rowEscapes?: number[]) {
        this.height = imgCanvas.canvas.height;
        this.spaceBetweenLetters = 1;
        this.spaceWidth = 2;

        this.charMap = charMap;
        this.chars = [];

        var lastCut = -1;
        var charIdx = 0;
        for(var row = 0; row < imgCanvas.canvas.width; row++) {
            if (rowEscapes == null || rowEscapes.indexOf(row) === -1) {
                var data = imgCanvas.getImageData(row, 0, 1, this.height).data;
                for (var i = 0; i < data.length; i++) { if (data[i] != 255) { break; } }
                if (i === data.length) {  //this row is all white
                    this.chars[charIdx] = imgCanvas.getImageData(lastCut+1, 0, row - lastCut - 1, this.height);
                    lastCut = row;
                    charIdx++;
                }
            }
        }
        this.chars[charIdx] = imgCanvas.getImageData(lastCut+1, 0, imgCanvas.canvas.width - lastCut - 1, this.height);
        if (this.charMap.length !== this.chars.length) {
            console.error("map is different length than char array; char map probably didn't load correctly")
        }
    }

    public drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color?: string) : void {
        var newPalette : Palette = <Palette>{ foreground: color };
        for(var i = 0; i < text.length; i++) {
            if (text[i] === " ") {
                x += this.spaceWidth + this.spaceBetweenLetters;
                continue;
            }
            var charIdx = this.charMap.indexOf(text[i]);
            if (charIdx === -1) {
                console.warn("could not print character '" + text[i] + "' with charmap '" + this.charMap + "'");
                x += this.spaceWidth + this.spaceBetweenLetters;
            } else {
                var charImg = this.chars[charIdx];
                if (color == null) {
                    ctx.putImageData(charImg, x, y);
                } else {
                    var composited = ctx.createImageData(charImg.width, charImg.height);
                    AssetLoader.composite(composited.data, charImg.data, ctx.getImageData(x, y, charImg.width, charImg.height).data, BitmapFont.fontPalette, newPalette);
                    ctx.putImageData(composited, x, y);
                }
                x += charImg.width + this.spaceBetweenLetters;
            }
        }
    }

    public drawTextRTL(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color?: string) : void {
        var newPalette : Palette = <Palette>{ foreground: color };
        for(var i = text.length-1; i >= 0; i--) {
            if (text[i] === " ") {
                x -= this.spaceWidth + this.spaceBetweenLetters;
                continue;
            }
            var charIdx = this.charMap.indexOf(text[i]);
            if (charIdx === -1 || charIdx >= this.chars.length) {
                console.warn("could not print character '" + text[i] + "'");
                x -= this.spaceWidth + this.spaceBetweenLetters;
            } else {
                var charImg = this.chars[charIdx];
                if (color == null) {
                    ctx.putImageData(this.chars[charIdx], x - charImg.width, y);
                } else {
                    var composited = ctx.createImageData(charImg.width, charImg.height);
                    AssetLoader.composite(composited.data, charImg.data, ctx.getImageData(x - charImg.width, y, charImg.width, charImg.height).data, BitmapFont.fontPalette, newPalette);
                    ctx.putImageData(composited, x - charImg.width, y);
                }
                x -= charImg.width + this.spaceBetweenLetters;
            }
        }
    }
}