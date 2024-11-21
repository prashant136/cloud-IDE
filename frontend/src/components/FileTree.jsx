import React from 'react'

function FileTreeNode({ fileName, nodes, onSelect, path }) {
    const isDir = !!nodes
    return (
        <div style={{ marginLeft: 10, cursor: 'pointer' }} onClick={(e) => {
            e.stopPropagation();
            if (isDir) return;
            onSelect(path);
        }}>
            <p style={{ fontWeight: isDir ? 'bold' : 'normal' }}>
                {isDir ? '🗂️ ' : '📄 '}
                {fileName}
            </p>
            {
                nodes && <ul>
                    {Object.keys(nodes).map((child, i) => {
                        return (
                            <li key={`${child}-${i}`}>
                                <FileTreeNode fileName={child} onSelect={onSelect} nodes={nodes[child]} path={path + "/" + child} />
                            </li>
                        )
                    })}
                </ul>
            }
        </div >
    )
}

export default function FileTree({ tree, onSelect }) {
    return (
        <FileTreeNode fileName={'/'} onSelect={onSelect} path={""} nodes={tree} />
    )
}
