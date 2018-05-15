import { EntityFieldInfo } from './entityFieldInfo';

export const listItemPropsInfo: Array<EntityFieldInfo> = [
    { internalName: 'AttachmentFiles', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'ContentType', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'DisplayName', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'EffectiveBasePermissions', type: 'SpBasePermissions', imports: ['SpBasePermissions'], readonly: true, enumerable: false },
    { internalName: 'EffectiveBasePermissionsForUI', type: 'SpBasePermissions', imports: ['SpBasePermissions'], readonly: true, enumerable: false },
    { internalName: 'FieldValuesAsHtml', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'FieldValuesAsText', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'FieldValuesForEdit', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'File', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'FileSystemObjectType', type: 'number', imports: [], readonly: true, enumerable: false },
    { internalName: 'Folder', type: 'any', imports: [], readonly: true, enumerable: false },
    { internalName: 'HasUniqueRoleAssignments', type: 'boolean', imports: [], readonly: true, enumerable: false },
    { internalName: 'Id', type: 'number', imports: [], readonly: true, enumerable: false },
    { internalName: 'ParentList', type: 'any', imports: [], readonly: true, enumerable: false }
];
