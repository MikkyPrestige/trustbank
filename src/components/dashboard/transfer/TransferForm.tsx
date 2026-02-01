'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TransferFormContent from './TransferFormContent';

interface Props {
    accounts: any[];
    beneficiaries: any[];
    preSelectedId?: string;
    limit: number;
}

export default function TransferForm(props: Props) {
    const [formKey, setFormKey] = useState(0);
    const router = useRouter();

    const handleReset = () => {
        router.refresh();
        setFormKey(prev => prev + 1);
    };

    return (
        <TransferFormContent
            key={formKey}
            {...props}
            onReset={handleReset}
        />
    );
}


// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import TransferFormContent from './TransferFormContent';

// interface Props {
//     accounts: any[];
//     beneficiaries: any[];
//     preSelectedId?: string;
// }

// export default function TransferForm(props: Props) {
//     const [formKey, setFormKey] = useState(0);
//     const router = useRouter();

//     const handleReset = () => {
//         router.refresh();
//         setFormKey(prev => prev + 1);
//     };

//     return (
//         <TransferFormContent
//             key={formKey}
//             {...props}
//             onReset={handleReset}
//         />
//     );
// }