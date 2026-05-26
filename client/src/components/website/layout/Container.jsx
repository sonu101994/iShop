export default function Container({
    children,
    className = ""
}) {

    return (

        // common container max width aur responsive padding 
        <div
            className={`
                       max-w-7xl
                       mx-auto
                       px-4
                       sm:px-6
                       lg:px-8
                       ${className}
                       `}
        >

            {/* children pages |components*/}
            {children}

        </div>

    )

}