# CTA ultrawide — geração v1

Ferramenta integrada image_gen, edição da foto footer.jpg original. Fontes originais preservadas. Primeira expansão: panorama da orla ao pôr do sol, grupo à esquerda e scooter à direita, centro livre para formulário. A solicitação inicial de proporção 5,05:1 retornou 3:1; não se afirma saída nativa 5:1.

A segunda edição ajustou escala e posição dos sujeitos para o recorte central. Resultado nativo real: 2172 × 724 px, salvo em assets/source/newsletter-ultrawide/mov-encontro-orla-ultrawide-v1.png. Conversão WebP em 1280, 1920 e 2172 px, sem upscale. Manifesto newsletter-ultrawide-manifest.json. Aplicado no desktop via picture/source; foto anterior no tablet/mobile. Captura de integração: artifacts/qa/newsletter-ultrawide.png.

## Prompt da edição final

```text
Edit this exact panorama. Keep the same scene, bridge, sunset, promenade, three people and their exact vehicles, same left/right arrangement. Change ONLY the scale and vertical placement of the three person+vehicle groups: make each group 25% SMALLER and move each group UP so every helmet and both wheels fit within the CENTRAL VERTICAL 45% of the entire image. This image will be center-cropped into a very shallow 5.05:1 banner, so the top 22% and bottom 22% will be discarded; no part of any person or vehicle can be in those areas. Specifically place all people and complete vehicles between y=28% and y=72%, preserving realistic perspective/contact with the road. Reconstruct the road around them seamlessly. Keep lots of unobstructed scenery in the middle horizontally for a web form. Preserve their identities and exact vehicle designs. No words, graphics, borders or new objects. Maintain ultrawide horizontal composition.
```

Expansão por IA: inspeção visual feita na imagem e no banner renderizado, sem alegação de equivalência técnica dos produtos a fotografia documental.
