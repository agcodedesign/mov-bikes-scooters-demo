import bpy,json
from pathlib import Path
ROOT=Path('D:/AG-DESIGN/AG_OPERACOES/01_CLIENTES/DEMOS/Mov-Mobile')
scenes=sorted([s for s in bpy.data.scenes if s.name.startswith('MOV — V8 Pro S')],key=lambda s:s.name)
scene=scenes[-1];bpy.context.window.scene=scene
for material in bpy.data.materials:
    if material.name.startswith('Textured black saddle'):
        shader=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        for link in list(shader.inputs['Base Color'].links):material.node_tree.links.remove(link)
        shader.inputs['Base Color'].default_value=(.006,.007,.008,1)
        shader.inputs['Metallic'].default_value=0
        shader.inputs['Roughness'].default_value=.72
        shader.inputs['Specular IOR Level'].default_value=.23
for obj in scene.objects:
    if obj.type=='MESH':
        for material in obj.data.materials:
            if material and material.name.startswith('Satin machined gunmetal'):
                shader=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
                shader.inputs['Base Color'].default_value=(.06,.07,.075,1)
                shader.inputs['Roughness'].default_value=.38
exec((ROOT/'scripts/polish-v8-pro-s.py').read_text(encoding='utf-8'))
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    if obj.name.startswith('part_') or (obj.parent and obj.parent.name.startswith('part_')):
        obj.select_set(True)
        if obj.name.startswith('part_'):obj['partId']=obj.name[5:].split('.')[0]
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/v8-pro-s.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT',export_extras=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets/source/v8-pro-s/v8-pro-s.blend'))
manifest=json.loads((ROOT/'assets/source/v8-pro-s/model-manifest.json').read_text())
manifest.update({'glbBytes':(ROOT/'public/models/v8-pro-s.glb').stat().st_size,'compression':'KHR_draco_mesh_compression, level 6','scene':scene.name,'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in scene.objects if o.type=='MESH'),'meshes':sum(o.type=='MESH' for o in scene.objects)})
(ROOT/'assets/source/v8-pro-s/model-manifest.json').write_text(json.dumps(manifest,indent=2))
scene.render.filepath=str(ROOT/'assets/source/v8-pro-s/preview.png');bpy.ops.render.render(write_still=True)
result=manifest
