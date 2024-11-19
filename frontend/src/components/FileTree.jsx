import React from 'react'

function FileTreeNode({ fileName, nodes, onSelect, path }) {
    const isDir = !!nodes
    return (
        <div style={{ marginLeft: 10 }} onClick={(e) => {
            e.stopPropagation();
            if (!isDir) return;
            onSelect(path);
        }}>
            <p style={{ fontWeight: isDir ? 'bold' : 'normal' }}>
                {isDir ? '🗂️ ' : '📄 '}
                {fileName}
            </p>
            {
                nodes && <ul>
                    {Object.keys(nodes).map(child => {
                        return (
                            <li>
                                <FileTreeNode fileName={child} nodes={nodes[child]} />
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
        <FileTreeNode fileName={'/'} onSelect={(path) => console.log("Select", path)} path={""} nodes={tree} />
    )
}
