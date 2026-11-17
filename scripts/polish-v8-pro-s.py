"""Replace provisional pipe fenders and round spokes with manufactured surfaces."""
import bpy,bmesh,math
from mathutils import Vector
scene=bpy.context.scene
if not scene.get('manufacturingRevision'):
    def material(prefix):
        return next(m for o in scene.objects if o.type=='MESH' for m in o.data.materials if m.name.startswith(prefix))
    paint=material('Powder-coated graphite');rubber=material('Black rubber');leather=material('Textured black saddle')
    for obj in list(scene.objects):
        if obj.type!='MESH' or not obj.parent:continue
        group=obj.parent.name.split('.')[0]
        if group not in ['part_frame','part_wheels']:continue
        if not any(m.name.startswith('Powder-coated graphite') for m in obj.data.materials):continue
        bm=bmesh.new();bm.from_mesh(obj.data);visited=set();remove=[]
        for vertex in bm.verts:
            if vertex in visited:continue
            stack=[vertex];component=[];visited.add(vertex)
            while stack:
                v=stack.pop();component.append(v)
                for edge in v.link_edges:
                    other=edge.other_vert(v)
                    if other not in visited:visited.add(other);stack.append(other)
            points=[obj.matrix_world@v.co for v in component]
            low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
            high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
            size=high-low;center=(high+low)/2
            fender=group=='part_frame' and size.x>.45 and size.y<.07 and low.z>.35 and high.z<.64
            spoke=group=='part_wheels' and len(component)==16
            if fender or spoke:remove.extend(component)
        bmesh.ops.delete(bm,geom=remove,context='VERTS');bm.to_mesh(obj.data);bm.free()
    frame=next(o for o in scene.objects if o.name.startswith('part_frame'))
    wheels=next(o for o in scene.objects if o.name.startswith('part_wheels'))
    collection=frame.users_collection[0]
    def mesh_object(name,vertices,faces,parent):
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.materials.append(paint)
        obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj);obj.parent=parent
        return obj
    for x in [-.52,.52]:
        vertices=[];faces=[];steps=48;cross=8
        for i in range(steps+1):
            a=-1.18+i/steps*2.18
            for j in range(cross+1):
                y=(j/cross-.5)*.13
                radius=.300-(abs(y)/.065)**2*.008
                vertices.append((x+math.sin(a)*radius,y,.285+math.cos(a)*radius))
        for i in range(steps):
            for j in range(cross):
                a=i*(cross+1)+j;faces.append((a,a+1,a+cross+2,a+cross+1))
        obj=mesh_object('Pressed curved mudguard',vertices,faces,frame)
        for p in obj.data.polygons:p.use_smooth=True
        thickness=obj.modifiers.new('Formed sheet thickness','SOLIDIFY');thickness.thickness=.0025
        bevel=obj.modifiers.new('Rolled edge','BEVEL');bevel.width=.001;bevel.segments=2
        bpy.context.view_layer.objects.active=obj
        for mod in list(obj.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
        for i in range(5):
            a=i*math.tau/5
            for offset in [-.095,.095]:
                start=Vector((x+math.sin(a)*.05,0,.285+math.cos(a)*.05))
                end=Vector((x+math.sin(a+offset)*.202,0,.285+math.cos(a+offset)*.202))
                tangent=(end-start).normalized();normal=Vector((tangent.z,0,-tangent.x))
                vertices=[]
                for center,width in [(start,.009),(end,.014)]:
                    for y,d in [(-.014,-1),(-.014,1),(.014,1),(.014,-1)]:vertices.append(tuple(center+normal*width*d+Vector((0,y,0))))
                obj=mesh_object('Cast tapered wheel spoke',vertices,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],wheels)
                bevel=obj.modifiers.new('Cast edge radius','BEVEL');bevel.width=.002;bevel.segments=2
                bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=bevel.name)
    # The seam is dark thread, never a bright metal wire.
    for obj in scene.objects:
        if obj.parent and obj.parent.name.startswith('part_seat') and obj.type=='MESH':
            for i,m in enumerate(obj.data.materials):
                if m.name.startswith('Satin machined'):obj.data.materials[i]=rubber
    scene['manufacturingRevision']=2

for obj in scene.objects:
    if obj.type!='MESH':continue
    for m in obj.data.materials:
        if not m.use_nodes:continue
        for node in m.node_tree.nodes:
            if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.12
        if m.name.startswith('Textured black saddle'):
            shader=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
            shader.inputs['Specular IOR Level'].default_value=.025
            for link in list(shader.inputs['Roughness'].links):m.node_tree.links.remove(link)
            shader.inputs['Roughness'].default_value=.86
