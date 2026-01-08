
import { CameraBody, LensType, FocalLength, AspectRatio, ImageSize, CameraAngle } from './types';

export const CAMERAS = Object.values(CameraBody);
export const LENSES = Object.values(LensType);
export const ANGLES = Object.values(CameraAngle);
export const FOCAL_LENGTHS: FocalLength[] = [8, 12, 18, 25, 35, 50, 75, 85, 100, 135];
export const RATIOS: AspectRatio[] = ["16:9", "4:3", "1:1", "9:16", "3:4"];
export const SIZES: ImageSize[] = ["1K", "2K", "4K"];

export const CAMERA_SPECS: Record<string, { desc: string; detail: string; usage: string; icon: string }> = {
  [CameraBody.IMAX]: {
    icon: "🎞️",
    desc: "Máy quay phim khổ lớn (65/70mm hoặc IMAX-certified)",
    detail: "Hình ảnh cực kỳ sắc, độ chi tiết và cảm giác “điện ảnh lớn”",
    usage: "Thường dùng cho cảnh hoành tráng, bom tấn"
  },
  [CameraBody.RED_VRAPTOR]: {
    icon: "🔴",
    desc: "Máy quay digital 8K hiện đại",
    detail: "Hình ảnh rất sắc nét, tương phản mạnh",
    usage: "Phù hợp phim hành động, sci-fi, quảng cáo cao cấp"
  },
  [CameraBody.SONY_VENICE]: {
    icon: "🎬",
    desc: "Máy quay full-frame cao cấp",
    detail: "Màu sắc tự nhiên, linh hoạt nhiều định dạng",
    usage: "Hay dùng cho phim điện ảnh, TVC, drama"
  },
  [CameraBody.ARRI_ALEXA_35]: {
    icon: "🎥",
    desc: "Chuẩn màu điện ảnh Hollywood",
    detail: "Dynamic range rất cao, highlight mượt",
    usage: "Phù hợp phim truyện, cảnh cảm xúc, ánh sáng phức tạp"
  },
  [CameraBody.ARRI_16SR]: {
    icon: "📼",
    desc: "Máy quay film 16mm cổ điển",
    detail: "Hạt film rõ, chất vintage, đời thực",
    usage: "Hay dùng cho indie, documentary, flashback"
  },
  [CameraBody.PANAVISION_DXL2]: {
    icon: "📹",
    desc: "Máy quay large-format cao cấp",
    detail: "Hình ảnh sang, chiều sâu mạnh",
    usage: "Thường dùng trong phim điện ảnh ngân sách lớn"
  }
};

export const ANGLE_SPECS: Record<string, { desc: string; detail: string; usage: string; prompt: string }> = {
  [CameraAngle.TOP_DOWN]: {
    desc: "Góc quay từ trên cao nhìn xuống (Chim bay/Flycam)",
    detail: "Bao quát toàn bộ bối cảnh, tạo cảm giác rộng lớn",
    usage: "Phù hợp cảnh kiến trúc, thiên nhiên hoặc bản đồ bối cảnh",
    prompt: "top-down aerial view, bird's-eye perspective, flycam shot, high altitude photography."
  },
  [CameraAngle.HIGH_ANGLE]: {
    desc: "Góc quay cao nhìn xuống nhân vật",
    detail: "Nhân vật trông nhỏ bé hoặc yếu thế hơn bối cảnh",
    usage: "Dùng để nhấn mạnh sự nhỏ bé hoặc cô đơn của nhân vật",
    prompt: "high-angle shot, looking down at the character, camera tilted downwards."
  },
  [CameraAngle.EYE_LEVEL]: {
    desc: "Góc máy ngang tầm mắt (Trực diện)",
    detail: "Tạo cảm giác chân thực, trung tính, như người xem đang đứng đó",
    usage: "Dùng cho hội thoại hoặc giới thiệu nhân vật cơ bản",
    prompt: "eye-level shot, front view perspective, neutral camera height, human-eye view."
  },
  [CameraAngle.LOW_ANGLE]: {
    desc: "Góc thấp nhìn lên (Góc anh hùng)",
    detail: "Nhân vật trông quyền lực, to lớn và ấn tượng",
    usage: "Dùng cho cảnh hành động, siêu anh hùng hoặc nhân vật quan trọng",
    prompt: "ultra low-angle shot, hero shot, looking up at the subject, camera on ground, dramatic power dynamic."
  },
  [CameraAngle.SIDE_PROFILE]: {
    desc: "Góc máy quay từ bên cạnh",
    detail: "Nhấn mạnh đường nét khuôn mặt hoặc hướng chuyển động",
    usage: "Dùng cho cảnh suy tư hoặc cảnh nhân vật đang di chuyển",
    prompt: "side profile view, side-on perspective, profile shot, lateral view."
  },
  [CameraAngle.THREE_QUARTER]: {
    desc: "Góc quay 3/4 (Góc 45 độ)",
    detail: "Góc quay chân dung đẹp nhất, tạo khối và chiều sâu tốt nhất",
    usage: "Thường dùng cho chân dung điện ảnh kinh điển",
    prompt: "three-quarter angle, 45-degree view, volumetric lighting on facial features, depth perception."
  },
  [CameraAngle.FROM_BEHIND]: {
    desc: "Góc máy quay từ phía sau",
    detail: "Tạo sự tò mò hoặc cho người xem thấy góc nhìn của nhân vật",
    usage: "Dùng cho cảnh nhân vật đang đi vào một thế giới mới",
    prompt: "view from behind, back view, over-the-shoulder-less back shot, following the subject."
  },
  [CameraAngle.OVER_SHOULDER]: {
    desc: "Góc máy qua vai",
    detail: "Góc máy kinh điển trong hội thoại, tạo sự kết nối không gian",
    usage: "Phù hợp cảnh đối thoại hoặc tương tác gần giữa 2 người",
    prompt: "over-the-shoulder shot, shallow focus on the subject, person's shoulder in foreground."
  }
};

export const LENS_SPECS: Record<string, { desc: string; detail: string; usage: string; prompt: string }> = {
  [LensType.ZEISS_ULTRA]: {
    desc: "Lens spherical rất sắc nét",
    detail: "Hình ảnh sạch, trung thực",
    usage: "Phù hợp quay hiện đại, kiểm soát tốt",
    prompt: "Zeiss Ultra Prime sharpness, neutral colors, clinical precision, high contrast."
  },
  [LensType.COOKE_S4]: {
    desc: "Lens spherical nổi tiếng với “Cooke Look”",
    detail: "Màu da ấm, mềm, dễ chịu",
    usage: "Hay dùng cho phim tình cảm, nhân vật",
    prompt: "Cooke S4i 'Cooke Look', warm organic skin tones, gentle highlights, silky textures."
  },
  [LensType.ARRI_SIGNATURE]: {
    desc: "Lens cao cấp của ARRI",
    detail: "Rất sắc nhưng vẫn mềm điện ảnh",
    usage: "Phù hợp digital cinema hiện đại",
    prompt: "ARRI Signature Prime look, natural creamy textures, modern cinematic clarity."
  },
  [LensType.CANON_K35]: {
    desc: "Lens vintage huyền thoại",
    detail: "Ánh sáng mềm, hơi glow, màu phim",
    usage: "Hay dùng để tạo cảm giác hoài niệm",
    prompt: "Canon K-35 vintage glow, nostalgic low contrast, golden era film aesthetic, halation."
  },
  [LensType.PANAVISION_C]: {
    desc: "Lens anamorphic 2×",
    detail: "Bokeh oval, flare ngang đặc trưng",
    usage: "Chất điện ảnh Hollywood cổ điển",
    prompt: "Panavision C-Series anamorphic, heavy oval bokeh, horizontal blue lens flares."
  },
  [LensType.HAWK_VLITE]: {
    desc: "Lens anamorphic hiện đại",
    detail: "Nhẹ, flare gọn, ít méo hơn Panavision",
    usage: "Phù hợp anamorphic cho digital cinema",
    prompt: "Hawk V-Lite anamorphic rendering, modern anamorphic squeeze, sharp centers."
  },
  [LensType.JDC_XTAL]: {
    desc: "Lens cine tiêu chuẩn",
    detail: "Hình ảnh trung tính, dễ kiểm soát",
    usage: "Thường dùng cho phim indie / TV",
    prompt: "JDC Xtal Xpress neutrality, clean professional cinema optics, balanced color."
  },
  [LensType.LAOWA_MACRO]: {
    desc: "Lens macro",
    detail: "Quay cận chi tiết cực nhỏ",
    usage: "Phù hợp texture, vật thể, chi tiết sản phẩm",
    prompt: "Laowa Macro extreme detail, microscopic texture focus, sharp foreground detail."
  },
  [LensType.LENSBABY]: {
    desc: "Lens sáng tạo",
    detail: "Bokeh xoáy, lệch tâm, mơ mộng",
    usage: "Dùng cho cảnh cảm xúc, nghệ thuật",
    prompt: "Lensbaby artistic tilt-shift, swirly dream-like bokeh, selective radial focus."
  },
  [LensType.PETZVAL]: {
    desc: "Lens cổ điển",
    detail: "Bokeh xoáy mạnh, viền mềm",
    usage: "Phù hợp phong cách vintage, dream-like",
    prompt: "Petzval swirly circular bokeh, vintage soft edges, central sharpness, antique feel."
  }
};
