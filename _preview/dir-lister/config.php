<?php

$public_config = (array)json_decode(file_get_contents("../config.json"), true);

return array(

    // Basic settings
    'hide_dot_files'            => true,
    'list_folders_first'        => true,
    'list_sort_order'           => 'natcasesort',
    'external_links_new_window' => true,

    // Hidden files
    'hidden_files' => array(
        '.ht*',
        '*/.ht*',
        '.git',
        '.gitignore',
        $public_config['backdoorDir'],
        $public_config['backdoorDir'].'/*',
        'node_modules',
        'node_modules/*'
    ),

    // Files that, if present in a directory, make the directory
    // a direct link rather than a browse link.
    'index_files' => array(
        'index.htm',
        'index.html',
        'index.php'
    ),

    // File hashing threshold
    'hash_size_limit' => 268435456, // 256 MB

    // Custom sort order
    'reverse_sort' => array(
        // 'path/to/folder'
    ),

    // Allow to download directories as zip files
    'zip_dirs' => false,

    // Stream zip file content directly to the client,
    // without any temporary file
    'zip_stream' => true,

    'zip_compression_level' => 0,

    // Disable zip downloads for particular directories
    'zip_disable' => array(
        // 'path/to/folder'
    ),

);
