import bpy, os
addons=[(name,item) for name,item in bpy.context.preferences.addons.items() if name.endswith('.mcp') or 'blender_mcp' in name]
configured=[]
for name,item in addons:
    prefs=item.preferences
    if hasattr(prefs,'use_autostart'):
        prefs.use_autostart=True
        bpy.ops.wm.save_userpref()
        configured.append({'addon':name,'autostart':prefs.use_autostart,'host':prefs.host,'port':prefs.port})
result={'configured':configured,'version':bpy.app.version_string,'pid':os.getpid(),'background':bpy.app.background,'activeFile':bpy.data.filepath}
