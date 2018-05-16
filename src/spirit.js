const stroke = `
  float stroke(float x, float s, float w) {
    float d = step(s,x+w*0.5) - step(s,x-w*.5);
    return clamp(d, 0., 1.);
  }
`

module.exports = {
  stroke,
  hangedMan:`

   vec3 hangedMan(vec3 color, vec2 st){
    float sdf = 0.5 + (st.x - st.y) * 0.5;
    color += stroke(sdf, 0.5, 0.1);
    float sdf_inv = (st.x, st.y) * 0.5;
    color += stroke(sdf_inv, 0.5, 0.1);
    return color;
   }

   `,

   temperance:`

    vec3 temperance(vec3 color, vec2 st, float amount){
      float offset = cos(st.y * (PI * amount)) * .15;
      color += stroke(st.x, 0.28 + offset, .1);
      color += stroke(st.x, 0.5 + offset, .1);
      color += stroke(st.x, 0.72 + offset, .1);
      return color;
   }
   `
}