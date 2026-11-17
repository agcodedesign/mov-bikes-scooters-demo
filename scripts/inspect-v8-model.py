import bpy
result={}
for obj in bpy.data.objects:
    if obj.parent and obj.parent.name.startswith('part_seat'):
        result[obj.name]=[{'name':m.name,'nodes':[n.type for n in m.node_tree.nodes] if m.use_nodes else [],'images':[{'name':n.image.name,'pixel':list(n.image.pixels[:4])} for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image]} for m in obj.data.materials]
