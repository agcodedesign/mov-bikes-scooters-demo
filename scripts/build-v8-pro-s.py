"""Photo-directed editorial reconstruction. Run inside Blender through official MCP."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
import numpy as np

ROOT = Path('D:/AG-DESIGN/AG_OPERACOES/01_CLIENTES/DEMOS/Mov-Mobile')
OUT = ROOT / 'assets/source/v8-pro-s'
OUT.mkdir(parents=True, exist_ok=True)
(ROOT / 'public/models').mkdir(parents=True, exist_ok=True)
scene = bpy.data.scenes.new('MOV — V8 Pro S')
bpy.context.window.scene = scene
collection = bpy.data.collections.new('V8 Pro S | editorial reconstruction')
scene.collection.children.link(collection)
parts = {}
for key in ['frame', 'battery', 'suspension', 'brakes', 'wheels', 'cockpit', 'light', 'seat', 'drivetrain']:
    obj = bpy.data.objects.new('part_' + key, None)
    collection.objects.link(obj)
    parts[key] = obj

def mat(name, rgb, metal=0, rough=.5, emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    m.node_tree.nodes.clear()
    p=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    output=m.node_tree.nodes.new('ShaderNodeOutputMaterial')
    m.node_tree.links.new(p.outputs['BSDF'],output.inputs['Surface'])
    p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if emission:
        p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=emission
    return m
black=mat('Powder-coated graphite metal',(.009,.011,.013),.45,.4)
metal=mat('Satin machined gunmetal',(.13,.15,.16),.85,.26)
rubber=mat('Black rubber, matte',(.016,.019,.020),0,.92)
silver=mat('Brushed steel and chain',(.38,.41,.42),.88,.3)
plastic=mat('Moulded battery casing',(.012,.014,.016),.05,.62)
leather=mat('Textured black saddle',(.025,.028,.03),0,.72)
next(n for n in leather.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Specular IOR Level'].default_value=.12
white=mat('Factory lettering',(.65,.68,.68),.15,.48)
amber=mat('Amber wheel reflectors',(.86,.24,.012),.15,.28)
red=mat('Rear red lens',(.3,.007,.008),.1,.24,.15)
glass=mat('Headlight smoked lens',(.16,.19,.2),.4,.16)
screen=mat('LCD muted blue green',(.16,.24,.23),.1,.38,.15)

# Exportable PBR image texture, not a Blender-only procedural shader.
rng=np.random.default_rng(8);n=rng.random((256,256)).astype(np.float32)
pixels=np.ones((256,256,4),np.float32);pixels[:,:,:3]=(.024+n[:,:,None]*.016)
texture=bpy.data.images.new('Saddle leather grain',width=256,height=256,alpha=True)
texture.pixels.foreach_set(pixels.ravel());texture.filepath_raw=str(OUT/'saddle-grain.png');texture.file_format='PNG';texture.save();texture.pack()
node=leather.node_tree.nodes.new('ShaderNodeTexImage');node.image=texture
leather.node_tree.links.new(node.outputs['Color'],next(n for n in leather.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'])

def assign(obj,name,material,part):
    obj.name=name
    for c in list(obj.users_collection):c.objects.unlink(obj)
    collection.objects.link(obj);obj.parent=parts[part]
    if material:obj.data.materials.append(material)
    return obj
def cube(name,loc,size,material,part,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=assign(bpy.context.object,name,material,part);o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Manufacturing edge radius','BEVEL');mod.width=bevel;mod.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
        for polygon in o.data.polygons:polygon.use_smooth=True
        normal=o.modifiers.new('Face-weighted manufacturing normals','WEIGHTED_NORMAL');normal.keep_sharp=True;normal.weight=50
        bpy.ops.object.modifier_apply(modifier=normal.name)
    return o
def cylinder(name,a,b,r,material,part,vertices=16):
    a,b=Vector(a),Vector(b);direction=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=direction.length,location=(a+b)/2)
    o=assign(bpy.context.object,name,material,part);o.rotation_euler=direction.to_track_quat('Z','Y').to_euler()
    for p in o.data.polygons:p.use_smooth=True
    return o
def curve(name,points,r,material,part):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=2;c.bevel_depth=r;c.bevel_resolution=2
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);collection.objects.link(o);o.parent=parts[part];c.materials.append(material);return o
def torus(name,loc,major,minor,material,part,seg=56,minor_seg=10):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=seg,minor_segments=minor_seg,location=loc,rotation=(math.pi/2,0,0))
    o=assign(bpy.context.object,name,material,part)
    for p in o.data.polygons:p.use_smooth=True
    return o
def label(text,loc,size,part,side=-1,angle=0):
    c=bpy.data.curves.new('Factory lettering','FONT');c.body=text;c.size=size;c.align_x='CENTER';c.extrude=.0001
    o=bpy.data.objects.new(text,c);collection.objects.link(o);o.parent=parts[part];o.location=loc;o.rotation_euler=(side*-math.pi/2,0,angle);c.materials.append(white)
    return o

for x,which in [(-.52,'rear'),(.52,'front')]:
    torus(which+' fat tire',(x,0,.285),.229,.049,rubber,'wheels',96,20)
    for y in [-.055,.055]:torus(which+' rim edge',(x,y,.285),.206,.008,metal,'wheels')
    torus(which+' dark alloy rim',(x,0,.285),.204,.018,black,'wheels')
    cylinder(which+' hub',(x,-.07,.285),(x,.07,.285),.077 if which=='rear' else .043,metal,'drivetrain' if which=='rear' else 'wheels',32)
    for i in range(5):
        a=i*math.tau/5
        for d in [-.10,.10]:
            b=a+d
            cylinder(which+' paired alloy spoke',(x+math.sin(a)*.055,0,.285+math.cos(a)*.055),(x+math.sin(b)*.2,0,.285+math.cos(b)*.2),.009,black,'wheels',8)
    for i in range(48):
        a=i*math.tau/48
        for row in [-1,0,1]:
            block=cube(which+' tread block',(x+math.sin(a)*.276,row*.031,.285+math.cos(a)*.276),(.025,.026,.009),rubber,'wheels',.0015)
            block.rotation_euler[1]=a
    # Thin rotor annulus; visible slots and caliper, not a solid silver disc.
    verts=[];faces=[]
    for i in range(48):
        a=i*math.tau/48
        for r in [.089,.127]:verts.append((x+math.sin(a)*r,-.077,.285+math.cos(a)*r))
    for i in range(48):j=(i+1)%48;faces.append((2*i,2*j,2*j+1,2*i+1))
    mesh=bpy.data.meshes.new(which+' rotor');mesh.from_pydata(verts,[],faces);mesh.materials.append(silver)
    o=bpy.data.objects.new(which+' ventilated brake rotor',mesh);collection.objects.link(o);o.parent=parts['brakes']
    for i in range(24):
        a=i*math.tau/24
        cylinder('Rotor ventilation',(x+math.sin(a)*.115,-.079,.285+math.cos(a)*.115),(x+math.sin(a)*.115,-.081,.285+math.cos(a)*.115),.0035,rubber,'brakes',6)
    cube(which+' hydraulic caliper',(x-.09,-.09,.37),(.045,.032,.07),black,'brakes',.007)
    for y in [-.028,.028]:
        ref=cube(which+' amber reflector',(x-.15,y,.16),(.07,.014,.024),amber,'wheels',.005);ref.rotation_euler[1]=-.5
    # Short fender arc hugs the tire.
    points=[(x+math.sin(a)*.296,0,.285+math.cos(a)*.296) for a in np.linspace(-1.2,1.0,30)]
    for y in [-.04,0,.04]:curve(which+' curved fender',[(p[0],y,p[2]) for p in points],.015,black,'frame')

for y in [-.092,.092]:
    curve('Upper seat rail',[(-.61,y,.83),(-.55,y,.87),(.27,y,.87),(.39,y,.84)],.018,black,'frame')
    cylinder('Seat down tube',(-.28,y,.85),(.005,y,.34),.018,black,'frame')
    cylinder('Lower chain stay',(-.52,y,.285),(.005,y,.34),.017,black,'frame')
    cylinder('Rear support',(-.52,y,.285),(-.47,y,.82),.014,black,'frame')
cylinder('Main down tube',(.005,0,.34),(.38,0,.82),.035,black,'frame')
cylinder('Head tube',(.37,0,.72),(.41,0,.9),.031,black,'frame')
cube('Controller body',(-.04,0,.42),(.2,.13,.11),plastic,'frame',.018)

# Two battery housings visible in the provided photographs.
cube('Upper removable battery',(-.08,0,.745),(.44,.16,.13),plastic,'battery',.022)
down=cube('Down-tube removable battery',(.205,0,.585),(.34,.14,.11),plastic,'battery',.018);down.rotation_euler[1]=-.89
for y in [-.083,.083]:
    cube('Battery latch',(.09,y,.76),(.025,.009,.04),metal,'battery',.003)
    label('OUXI',(.2,y,.6),.038,'battery',-1 if y<0 else 1,0)

for y in [-.105,.105]:
    cylinder('Front fork lower',(.52,y,.285),(.455,y,.67),.026,black,'suspension',24)
    cylinder('Front fork stanchion',(.455,y,.63),(.405,y,.9),.016,metal,'suspension',20)
    for z in [.76,.87]:cylinder('Fork crown',(.4,-.12,z),(.4,.12,z),.02,black,'suspension')
for y in [-.125,.125]:
    a=Vector((-.5,y,.38));b=Vector((-.27,y,.775));axis=(b-a).normalized()
    cylinder('Rear shock damper',a,b,.015,metal,'suspension')
    u=Vector((0,1,0));v=axis.cross(u).normalized()
    pts=[]
    for i in range(145):
        t=i/144;angle=t*math.tau*8;p=a+(b-a)*t+(u*math.cos(angle)+v*math.sin(angle))*.025;pts.append(tuple(p))
    curve('Rear coil spring',pts,.004,black,'suspension')
    for p in [a,b]:cylinder('Shock mounting bolt',(p.x,y-.013,p.z),(p.x,y+.013,p.z),.013,silver,'suspension')

seat=cube('Long black stitched saddle',(-.2,0,.935),(.79,.265,.083),leather,'seat',.036)
for x in np.linspace(-.52,.12,9):
    curve('Saddle stitched channel',[(x,-.114,.96),(x,-.10,.979),(x,.10,.979),(x,.114,.96)],.0008,metal,'seat')
curve('Saddle edge piping',[(-.56,-.115,.943),(.17,-.115,.943),(.19,0,.943),(.17,.115,.943),(-.56,.115,.943),(-.59,0,.943),(-.56,-.115,.943)],.0018,metal,'seat')
for side in [-1,1]:
    panel_mesh=bpy.data.meshes.new('Triangular rear side panel')
    panel_mesh.from_pydata([(-.59,side*.105,.842),(-.22,side*.105,.842),(-.29,side*.105,.662)],[],[(0,1,2)])
    panel=bpy.data.objects.new('Rear triangular side panel',panel_mesh);collection.objects.link(panel);panel.parent=parts['frame'];panel_mesh.materials.append(plastic)
    label('V8 Pro',(-.39,side*.109,.775),.036,'frame',side)

cylinder('Handlebar stem',(.405,0,.89),(.35,0,1.105),.022,black,'cockpit')
curve('Raised wide handlebar',[(.35,-.31,1.13),(.36,-.20,1.13),(.39,-.12,1.07),(.39,.12,1.07),(.36,.20,1.13),(.35,.31,1.13)],.012,black,'cockpit')
for side in [-1,1]:
    cylinder('Rubber grip',(.35,side*.215,1.13),(.35,side*.32,1.13),.018,rubber,'cockpit',24)
    for i in range(9):cylinder('Grip rib',(.35,side*(.22+i*.011),1.13),(.35,side*(.224+i*.011),1.13),.019,rubber,'cockpit')
    cylinder('Brake lever',(.35,side*.205,1.13),(.3,side*.29,1.12),.005,metal,'brakes')
    curve('Brake hose',[(.34,side*.2,1.12),(.47,side*.12,1.02),(.5,side*.07,.92),(.44,side*.065,.8)],.003,rubber,'cockpit')
display=cube('Dashboard black housing',(.37,-.035,1.07),(.075,.085,.022),black,'cockpit',.006);display.rotation_euler[1]=.24
lcd=cube('LCD display',(.366,-.035,1.084),(.055,.061,.003),screen,'cockpit',.001);lcd.rotation_euler[1]=.24

cylinder('Headlight housing',(.49,0,.85),(.605,0,.85),.105,black,'light',48)
cylinder('Headlight rim',(.603,0,.85),(.615,0,.85),.106,metal,'light',48)
cylinder('Headlight glass',(.614,0,.85),(.617,0,.85),.096,glass,'light',48)
for offset in [-.065,-.032,0,.032,.065]:
    length=math.sqrt(.095**2-offset**2)
    cylinder('Protective grille vertical',(.624,offset,.85-length),(.624,offset,.85+length),.003,black,'light',8)
    cylinder('Protective grille horizontal',(.626,-length,.85+offset),(.626,length,.85+offset),.003,black,'light',8)
cube('Rear light',(-.617,0,.83),(.025,.095,.031),red,'light',.009)

cylinder('Crank axle',(.005,-.15,.34),(.005,.15,.34),.018,metal,'drivetrain')
torus('Front chainring',(.005,-.14,.34),.089,.007,black,'drivetrain',40)
for side in [-1,1]:
    cylinder('Crank arm',(.005,side*.15,.34),(.08,side*.15,.23),.012,black,'drivetrain')
    pedal=cube('Platform pedal',(.08,side*.21,.23),(.10,.085,.025),black,'drivetrain',.006)
    cube('Pedal amber insert',(.08,side*.253,.23),(.074,.003,.012),amber,'drivetrain')
for i in range(7):torus('Rear cassette',(-.52,-.08-i*.004,.285),.055-i*.004,.003,silver,'drivetrain',24,6)
curve('Upper chain run',[(-.52,-.14,.34),(.005,-.14,.43)],.0035,silver,'drivetrain')
curve('Lower chain run',[(-.52,-.14,.23),(.005,-.14,.25)],.0035,silver,'drivetrain')
cylinder('Derailleur arm',(-.56,-.11,.26),(-.58,-.11,.17),.012,black,'drivetrain')
torus('Derailleur jockey',(-.58,-.11,.17),.02,.004,black,'drivetrain',20,6)
curve('Kickstand',[(.01,.1,.35),(-.08,.18,.04),(-.15,.2,.03)],.009,black,'frame')

# Detail pass is shared with the reproducible build and runs through Blender MCP.
exec((ROOT/'scripts/detail-v8-pro-s.py').read_text(encoding='utf-8'))

# Convert and merge by component/material. Nine semantic groups retain picking boundaries.
bpy.ops.object.select_all(action='DESELECT')
for obj in list(collection.objects):
    if obj.type in {'CURVE','FONT'}:
        obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH');obj.select_set(False)
for key,parent in parts.items():
    by_material={}
    for obj in list(parent.children):
        if obj.type=='MESH':by_material.setdefault(obj.data.materials[0].name if obj.data.materials else 'none',[]).append(obj)
    for material,objects in by_material.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
        bpy.context.object.name=key+'__'+material

scene.render.engine='CYCLES';scene.cycles.samples=32
scene.world=bpy.data.worlds.new('MOV studio world');scene.world.use_nodes=True
world_background=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND')
world_background.inputs[0].default_value=(.055,.065,.07,1)
world_background.inputs[1].default_value=.5
def area(name,loc,power,size,color):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.5))-o.location).to_track_quat('-Z','Y').to_euler()
area('Softbox key',(1.2,-2.2,3),450,3,(.93,.96,1))
area('Warm rim',(-1.5,1,2),600,2,(1,.69,.36))
area('Fill',(0,2,1.4),200,2,(.62,.74,1))
cam_data=bpy.data.cameras.new('MOV product camera');cam=bpy.data.objects.new('MOV product camera',cam_data);scene.collection.objects.link(cam)
cam.location=(2.05,-3.05,1.7);cam.rotation_euler=(Vector((0,0,.58))-cam.location).to_track_quat('-Z','Y').to_euler();cam_data.lens=55;scene.camera=cam
scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
bpy.ops.object.select_all(action='DESELECT')
for obj in collection.objects:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/v8-pro-s.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False,export_materials='EXPORT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'v8-pro-s.blend'))
triangles=sum(sum(len(p.vertices)-2 for p in obj.data.polygons) for obj in collection.objects if obj.type=='MESH')
summary={'model':'Editorial reconstruction from supplied photographs','triangles':triangles,'meshes':sum(o.type=='MESH' for o in collection.objects),'groups':list(parts),'glbBytes':(ROOT/'public/models/v8-pro-s.glb').stat().st_size,'blend':str(OUT/'v8-pro-s.blend')}
(OUT/'model-manifest.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
scene.render.filepath=str(OUT/'preview.png');bpy.ops.render.render(write_still=True)
result=summary
