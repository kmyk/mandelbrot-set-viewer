precision mediump float;
uniform vec2 uOffset;
uniform float uScale;
uniform vec2  uResolution;

void main(void){
    vec2 p = (gl_FragCoord.xy - uResolution / 2.0) / min(uResolution.x, uResolution.y);
    vec2 c = p * uScale + uOffset;
    vec2 z = vec2(0, 0);
    int cnt = 0;
    for (int i = 0; i < 100; ++ i) {
        ++ cnt;
        if (length(z) > 5.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    }
    float t = float(cnt) / 100.0;
    gl_FragColor = vec4(t, t, t, 1.0);
}
