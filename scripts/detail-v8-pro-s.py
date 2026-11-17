"""Manufacturing detail and exportable PBR microstructure; executed by build-v8-pro-s.py."""
def microtexture(material, name, seed, strength, roughness):
    size=512
    random=np.random.default_rng(seed)
    noise=random.random((size,size)).astype(np.float32)
    smooth=noise.copy()
    for _ in range(3):
        smooth=(smooth+np.roll(smooth,1,0)+np.roll(smooth,-1,0)+np.roll(smooth,1,1)+np.roll(smooth,-1,1))/5
    height=smooth*.7+noise*.05
    dy,dx=np.gradient(height)
    normals=np.stack((-dx*strength,-dy*strength,np.ones_like(dx)),axis=-1)
    normals/=np.linalg.norm(normals,axis=-1,keepdims=True)
    rgba=np.ones((size,size,4),np.float32);rgba[:,:,:3]=normals*.5+.5
    image=bpy.data.images.new(name+' normal',width=size,height=size,alpha=False)
    image.colorspace_settings.name='Non-Color';image.pixels.foreach_set(rgba.ravel())
    image.filepath_raw=str(OUT/(name+'-normal.png'));image.file_format='PNG';image.save();image.pack()
    nodes=material.node_tree.nodes;links=material.node_tree.links
    shader=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    tex=nodes.new('ShaderNodeTexImage');tex.image=image
    normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.45
    links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],shader.inputs['Normal'])
    rough_image=bpy.data.images.new(name+' roughness',width=size,height=size,alpha=False)
    rough_image.colorspace_settings.name='Non-Color'
    rgba[:,:,:3]=(roughness+(smooth-.5)*.18)[:,:,None]
    rough_image.pixels.foreach_set(rgba.ravel());rough_image.filepath_raw=str(OUT/(name+'-roughness.png'));rough_image.file_format='PNG';rough_image.save();rough_image.pack()
    tex=nodes.new('ShaderNodeTexImage');tex.image=rough_image;links.new(tex.outputs['Color'],shader.inputs['Roughness'])

# Keep the saddle black while separating leather, rubber, paint and machined metal.
shader=next(n for n in leather.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
for link in list(shader.inputs['Base Color'].links):leather.node_tree.links.remove(link)
shader.inputs['Base Color'].default_value=(.007,.008,.009,1)
shader.inputs['Specular IOR Level'].default_value=.23
microtexture(leather,'saddle-pebbled-grain',19,7,.7)
microtexture(rubber,'tire-rubber',23,3,.87)
microtexture(black,'powder-coated-metal',31,.9,.4)
microtexture(plastic,'battery-polymer',32,1.5,.52)

thread=mat('Subtle black saddle stitching',(.026,.03,.03),0,.85)
for x in np.linspace(-.52,.12,9):
    for y in np.linspace(-.1,.1,22):
        cylinder('Individual saddle stitch',(x,y,.9805),(x,y+.0035,.9805),.00045,thread,'seat',6)

def bolt(name,point,axis='y',radius=.006,part='frame'):
    p=Vector(point);v=Vector((0,.004,0) if axis=='y' else (0,0,.004))
    cylinder(name,p-v,p+v,radius,silver,part,6)
    cylinder('Recessed hex socket',p+v,p+v*1.2,radius*.48,black,part,6)

for side in [-1,1]:
    for x,z in [(-.52,.285),(-.28,.85),(.005,.34),(.41,.88),(-.48,.82),(-.29,.69)]:
        bolt('Frame fixing',(x,side*.112,z),part='frame')
    for z in [.76,.87]:bolt('Fork crown clamp',(.402,side*.122,z),radius=.007,part='suspension')
    for x,z in [(.45,.62),(.52,.29),(-.5,.38),(-.27,.775)]:
        bolt('Suspension fastening',(x,side*.13,z),radius=.008,part='suspension')
    for x in [-.24,.08]:
        cube('Battery mounting saddle',(x,side*.084,.69),(.035,.015,.025),black,'battery',.003)
        bolt('Battery cover screw',(x,side*.083,.75),radius=.0035,part='battery')
    # Cover parting lines and lock barrel: functional surface detail visible in close-ups.
    curve('Battery casing parting line',[(-.282,side*.079,.73),(.12,side*.079,.73),(.135,side*.074,.75)],.001,black,'battery')
    cylinder('Battery lock barrel',(.09,side*.081,.775),(.09,side*.088,.775),.009,silver,'battery',20)
    cube('Battery key slot',(.09,side*.089,.775),(.0015,.001,.008),black,'battery')
    # Rim bead and sidewall moulding, including tire lettering from the supplied photos.
    for x in [-.52,.52]:
        torus('Raised sidewall moulding',(x,side*.036,.285),.252,.0008,rubber,'wheels',96,6)
        torus('Tire bead seam',(x,side*.039,.285),.216,.001,rubber,'wheels',96,6)
        for i,char in enumerate('KENDA'):
            angle=(i-2)*.145
            text=label(char,(x+math.sin(angle)*.242,side*.047,.285+math.cos(angle)*.242),.028,'wheels',side)
            text.rotation_euler[1]=-angle
        for angle in [1.3,2.9,4.7]:
            xx=x+math.sin(angle)*.205;zz=.285+math.cos(angle)*.205
            bolt('Wheel rim fixing',(xx,side*.022,zz),radius=.003,part='wheels')
    # Braided hydraulic lines continue from the controls down the fork.
    curve('Hydraulic brake line',[(.44,side*.072,.8),(.46,side*.088,.62),(.49,side*.112,.46),(.43,side*.11,.36)],.0025,rubber,'brakes')

for i in range(4):
    cube('Battery status LED',(-.12+i*.012,-.082,.785),(.006,.001,.003),screen,'battery',.0008)

for x in [-.52,.52]:
    for i in range(6):
        a=i*math.tau/6
        cylinder('Brake rotor carrier',(x+math.sin(a)*.035,-.078,.285+math.cos(a)*.035),(x+math.sin(a+.16)*.094,-.078,.285+math.cos(a+.16)*.094),.006,silver,'brakes',8)
        bolt('Brake rotor bolt',(x+math.sin(a)*.039,-.083,.285+math.cos(a)*.039),radius=.0035,part='brakes')

# Individual chain rollers and link plates replace the two smooth wire runs.
for a,b in [((-.52,-.14,.34),(.005,-.14,.43)),((-.52,-.14,.23),(.005,-.14,.25))]:
    a,b=Vector(a),Vector(b)
    for i in range(43):
        p=a.lerp(b,i/42)
        cylinder('Chain roller',(p.x,p.y-.003,p.z),(p.x,p.y+.003,p.z),.0027,silver,'drivetrain',8)
        if i<42:
            q=a.lerp(b,(i+1)/42)
            for side in [-1,1]:cylinder('Chain link plate',(p.x,p.y+side*.004,p.z),(q.x,q.y+side*.004,q.z),.0017,metal,'drivetrain',6)
for i in range(5):
    a=i*math.tau/5
    cylinder('Chainring spider',(.005,-.14,.34),(.005+math.sin(a)*.086,-.14,.34+math.cos(a)*.086),.007,black,'drivetrain',8)
for side in [-1,1]:
    for x in [.045,.115]:
        for y in [.18,.24]:bolt('Pedal traction pin',(x,side*y,.245),'z',.002,'drivetrain')

# Headlamp reflector and prismatic inner elements, seen through a smoky lens.
reflector=mat('Headlamp reflector',(.42,.45,.46),.95,.18)
for y,z in [(-.04,.85),(.04,.85),(0,.89),(0,.81)]:
    cylinder('LED reflector cup',(.617,y,z),(.619,y,z),.022,reflector,'light',24)
    cylinder('LED optic centre',(.620,y,z),(.621,y,z),.007,white,'light',16)
for side in [-1,1]:
    bolt('Headlamp mount',(.53,side*.107,.85),radius=.005,part='light')
    cube('Handlebar switch cluster',(.355,side*.20,1.13),(.04,.027,.045),plastic,'cockpit',.007)
    cube('Switch rocker',(.336,side*.20,1.145),(.007,.015,.012),black,'cockpit',.002)

# Screen markings are geometry, so they remain visible without external textures.
for i in range(3):cube('LCD information row',(.36+i*.009,-.035,1.09),(.003,.032,.001),white,'cockpit')
