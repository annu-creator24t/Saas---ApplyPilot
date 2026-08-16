import math
from PIL import Image, ImageDraw, ImageFont

def create_applypilot_icon(size: int) -> Image.Image:
    # High-res master image (4x supersampling for crisp edges)
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background with vibrant gradient
    r = int(canvas_size * 0.22)
    
    # Draw gradient background in high resolution
    base = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(base)
    bdraw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=r, fill=(134, 59, 255, 255))
    
    # Create smooth diagonal gradient (Indigo to Violet to Blue)
    grad = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grad)
    for y in range(canvas_size):
        for x in range(canvas_size):
            t = (x + y) / (2.0 * canvas_size)
            # Interpolate from #6366F1 (99, 102, 241) to #8B5CF6 (139, 92, 246) to #3B82F6 (59, 130, 246)
            if t < 0.5:
                f = t * 2.0
                red = int(99 + (139 - 99) * f)
                green = int(102 + (92 - 102) * f)
                blue = int(241 + (246 - 241) * f)
            else:
                f = (t - 0.5) * 2.0
                red = int(139 + (59 - 139) * f)
                green = int(92 + (130 - 92) * f)
                blue = int(246 + (246 - 246) * f)
            gdraw.point((x, y), fill=(red, green, blue, 255))

    # Mask gradient with rounded rect
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=r, fill=255)
    
    img.paste(grad, (0, 0), mask)
    
    # Draw sleek paper-airplane / supersonic jet pilot emblem in center
    draw = ImageDraw.Draw(img)
    cx, cy = canvas_size / 2.0, canvas_size / 2.0
    s = canvas_size * 0.28
    
    # Supersonic Jet / Pilot Shape
    # Nose: (cx + s * 0.9, cy - s * 0.7)
    # Left wing tip: (cx - s * 0.85, cy - s * 0.2)
    # Body notch: (cx - s * 0.35, cy + s * 0.1)
    # Right wing tip: (cx + s * 0.2, cy + s * 0.85)
    p_nose = (cx + s * 0.85, cy - s * 0.7)
    p_left_wing = (cx - s * 0.85, cy - s * 0.15)
    p_notch = (cx - s * 0.2, cy + s * 0.15)
    p_right_wing = (cx + s * 0.15, cy + s * 0.85)

    # Top wing fold (pure white)
    draw.polygon([p_nose, p_left_wing, p_notch], fill=(255, 255, 255, 255))
    # Bottom wing fold (slight shadow white/cyan)
    draw.polygon([p_nose, p_notch, p_right_wing], fill=(215, 235, 255, 235))
    # Center crease line
    draw.line([p_nose, p_notch], fill=(160, 190, 255, 200), width=max(1, int(canvas_size * 0.02)))
    
    # Downscale using high quality Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

if __name__ == "__main__":
    for sz in [16, 48, 128]:
        out_img = create_applypilot_icon(sz)
        out_img.save(f"public/icon{sz}.png", "PNG")
        out_img.save(f"dist/icon{sz}.png", "PNG")
    print("Icons generated successfully!")
