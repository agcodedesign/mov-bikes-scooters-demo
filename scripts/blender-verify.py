import bpy
result = {'version': bpy.app.version_string, 'background': bpy.app.background, 'file': bpy.data.filepath, 'scene': bpy.context.scene.name, 'objects': len(bpy.data.objects)}
